/* eslint-disable */
import { db } from '../src/lib/db';
import { withTenantContext, withBypassContext } from '../src/lib/tenant-context';

async function runTests() {
  console.log('🏁 Starting RLS validation test suite...');

  // 1. Setup - Create two temporary test properties in a system bypass context (explicitly awaiting inside the wrapper)
  const propA = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'Test Hotel Alpha',
        type: 'HOTEL',
        address: '123 Alpha Road',
      },
    })
  );

  const propB = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'Test Hotel Beta',
        type: 'HOTEL',
        address: '456 Beta Road',
      },
    })
  );

  console.log(`Created Property Alpha: ${propA.id}`);
  console.log(`Created Property Beta: ${propB.id}`);

  // Create default departments for these properties to satisfy referential integrity
  // Note: We run inside their respective tenant contexts and pass propertyId to satisfy TS types.
  const deptA = await withTenantContext(propA.id, async () =>
    await db.department.create({
      data: {
        propertyId: propA.id,
        name: 'Housekeeping',
        description: 'Housekeeping for Alpha',
      },
    })
  );

  const deptB = await withTenantContext(propB.id, async () =>
    await db.department.create({
      data: {
        propertyId: propB.id,
        name: 'Housekeeping',
        description: 'Housekeeping for Beta',
      },
    })
  );

  const workflowA = await withTenantContext(propA.id, async () =>
    await db.workflow.create({
      data: {
        propertyId: propA.id,
        type: 'TEST',
        status: 'PENDING',
      },
    })
  );

  const workflowB = await withTenantContext(propB.id, async () =>
    await db.workflow.create({
      data: {
        propertyId: propB.id,
        type: 'TEST',
        status: 'PENDING',
      },
    })
  );

  // 2. Create tasks under their respective tenant contexts
  const taskA = await withTenantContext(propA.id, async () =>
    await db.task.create({
      data: {
        propertyId: propA.id,
        workflowId: workflowA.id,
        departmentId: deptA.id,
        title: 'Alpha Clean Room 101',
        priority: 'MEDIUM',
        status: 'PENDING',
      },
    })
  );

  const taskB = await withTenantContext(propB.id, async () =>
    await db.task.create({
      data: {
        propertyId: propB.id,
        workflowId: workflowB.id,
        departmentId: deptB.id,
        title: 'Beta Clean Room 202',
        priority: 'HIGH',
        status: 'PENDING',
      },
    })
  );

  console.log(`Created Task A: "${taskA.title}" under Property Alpha.`);
  console.log(`Created Task B: "${taskB.title}" under Property Beta.`);

  // 3. Test Isolation - Query under Property Alpha context
  await withTenantContext(propA.id, async () => {
    console.log('\n--- Testing Context: Property Alpha ---');
    const tasks = await db.task.findMany();
    console.log(`Tasks found in Alpha Context: ${tasks.length}`);
    tasks.forEach((t) => console.log(` - Task ID: ${t.id}, Title: "${t.title}", Property: ${t.propertyId}`));

    // Assertions
    const hasAlphaTask = tasks.some((t) => t.id === taskA.id);
    const hasBetaTask = tasks.some((t) => t.id === taskB.id);
    if (hasAlphaTask && !hasBetaTask) {
      console.log('✅ PASS: Context Alpha isolated correctly (sees A, does not see B).');
    } else {
      console.error('❌ FAIL: Context Alpha leaked data or missed records.');
    }

    // Try a raw query to verify Database-level RLS is enforced
    console.log('Executing raw SQL query to test Postgres RLS enforcement...');
    const rawTasks = await db.$queryRawUnsafe('SELECT * FROM "Task"') as any[];
    console.log(`Raw tasks returned: ${rawTasks.length}`);
    const rawHasBeta = rawTasks.some((t) => t.id === taskB.id);
    if (!rawHasBeta) {
      console.log('✅ PASS: Database-level RLS successfully blocked cross-tenant access for raw SQL queries.');
    } else {
      console.error('❌ FAIL: Database-level RLS bypassed by raw SQL query!');
    }
  });

  // 4. Test Isolation - Query under Property Beta context
  await withTenantContext(propB.id, async () => {
    console.log('\n--- Testing Context: Property Beta ---');
    const tasks = await db.task.findMany();
    console.log(`Tasks found in Beta Context: ${tasks.length}`);
    tasks.forEach((t) => console.log(` - Task ID: ${t.id}, Title: "${t.title}", Property: ${t.propertyId}`));

    // Assertions
    const hasAlphaTask = tasks.some((t) => t.id === taskA.id);
    const hasBetaTask = tasks.some((t) => t.id === taskB.id);
    if (!hasAlphaTask && hasBetaTask) {
      console.log('✅ PASS: Context Beta isolated correctly (sees B, does not see A).');
    } else {
      console.error('❌ FAIL: Context Beta leaked data or missed records.');
    }
  });

  // 5. Test Closed-by-Default (Query without any context)
  console.log('\n--- Testing Context: No Tenant Context ---');
  // Note: We run outside withTenantContext.
  // Because no context is set, the Prisma Client extension does not inject filters,
  // and database RLS doesn't have app.current_property_id.
  // Postgres RLS should reject all rows from being returned for tables with forced RLS.
  const tasksNoContext = await db.task.findMany();
  console.log(`Tasks found with No Context: ${tasksNoContext.length}`);
  const hasTestTasks = tasksNoContext.some((t) => t.id === taskA.id || t.id === taskB.id);
  if (!hasTestTasks) {
    console.log('✅ PASS: Closed-by-default enforced. No tenant context yields no test records.');
  } else {
    console.error('❌ FAIL: Data leak! Unscoped request returned tenant records.');
  }

  // 6. Cleanup - Delete the test properties and records in bypass context for simplicity
  console.log('\n🧹 Cleaning up test records...');
  await withBypassContext(async () => {
    await db.task.deleteMany({ where: { id: { in: [taskA.id, taskB.id] } } });
    await db.workflow.deleteMany({ where: { id: { in: [workflowA.id, workflowB.id] } } });
    await db.department.deleteMany({ where: { id: { in: [deptA.id, deptB.id] } } });
    await db.property.deleteMany({ where: { id: { in: [propA.id, propB.id] } } });
  });
  console.log('Cleanup complete.');
  console.log('\n🎉 RLS validation test suite finished.');
}

runTests().catch((e) => {
  console.error('Test execution failed:', e);
});
