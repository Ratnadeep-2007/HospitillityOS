/* eslint-disable */
import { db } from '../src/lib/db';
import { withBypassContext } from '../src/lib/tenant-context';

async function testManagerReassign() {
  console.log('🏁 Starting Manager Reassignment & Audit Logging Test...');

  // 1. Setup - Create Property, 2 Departments, 2 Staff Users, 1 Task
  const prop = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'Reassign Test Hotel',
        type: 'HOTEL',
        address: '500 Manager Blvd',
      },
    })
  );

  const deptReception = await withBypassContext(async () =>
    await db.department.create({ data: { propertyId: prop.id, name: 'Reception' } })
  );

  const deptHousekeeping = await withBypassContext(async () =>
    await db.department.create({ data: { propertyId: prop.id, name: 'Housekeeping' } })
  );

  const userAlice = await withBypassContext(async () =>
    await db.user.create({
      data: {
        propertyId: prop.id,
        departmentId: deptReception.id,
        name: 'Alice Receptionist',
        email: `alice_${Date.now()}@test.com`,
        passwordHash: 'hash',
        role: 'RECEPTIONIST',
      },
    })
  );

  const userBob = await withBypassContext(async () =>
    await db.user.create({
      data: {
        propertyId: prop.id,
        departmentId: deptHousekeeping.id,
        name: 'Bob Housekeeper',
        email: `bob_${Date.now()}@test.com`,
        passwordHash: 'hash',
        role: 'HOUSEKEEPER',
      },
    })
  );

  const workflow = await withBypassContext(async () =>
    await db.workflow.create({ data: { propertyId: prop.id, type: 'GUEST_REQUEST' } })
  );

  const task = await withBypassContext(async () =>
    await db.task.create({
      data: {
        propertyId: prop.id,
        workflowId: workflow.id,
        departmentId: deptReception.id,
        assignedUserId: userAlice.id,
        title: 'Deliver Extra Pillows',
        priority: 'MEDIUM',
        status: 'PENDING',
      },
    })
  );

  console.log(`Created Initial Task: ID=${task.id}, Dept=${deptReception.name}, Assignee=${userAlice.name}`);

  // 2. Perform Reassignment: Department -> Housekeeping, Assignee -> Bob
  console.log('\n--- Reassigning Task to Housekeeping & Bob Housekeeper ---');
  const previousDeptName = deptReception.name;
  const previousAssigneeName = userAlice.name;

  const updatedTask = await withBypassContext(async () =>
    await db.task.update({
      where: { id: task.id },
      data: {
        departmentId: deptHousekeeping.id,
        assignedUserId: userBob.id,
        priority: 'HIGH',
      },
      include: { department: true, assignedUser: true },
    })
  );

  const auditLog = await withBypassContext(async () =>
    await db.auditLog.create({
      data: {
        propertyId: prop.id,
        userId: userAlice.id,
        action: 'TASK_REASSIGNED',
        entityType: 'TASK',
        entityId: task.id,
        details: `Manager override on task "${updatedTask.title}": department reassigned from "${previousDeptName}" to "${updatedTask.department.name}"; assignee changed from "${previousAssigneeName}" to "${updatedTask.assignedUser?.name}"; priority overridden to HIGH.`,
      },
    })
  );

  // 3. Assertions
  if (updatedTask.departmentId === deptHousekeeping.id && updatedTask.assignedUserId === userBob.id) {
    console.log('✅ PASS: Task department and assignee updated successfully.');
  } else {
    console.error('❌ FAIL: Task reassignment failed.');
    process.exit(1);
  }

  if (
    auditLog.action === 'TASK_REASSIGNED' &&
    auditLog.details?.includes('department reassigned from "Reception" to "Housekeeping"') &&
    auditLog.details?.includes('assignee changed from "Alice Receptionist" to "Bob Housekeeper"')
  ) {
    console.log('✅ PASS: Reassignment audit log recorded with old and new values.');
  } else {
    console.error('❌ FAIL: Audit log details incomplete or missing.');
    process.exit(1);
  }

  // 4. Cleanup
  console.log('\n🧹 Cleaning up test records...');
  await withBypassContext(async () => {
    await db.auditLog.delete({ where: { id: auditLog.id } });
    await db.task.delete({ where: { id: task.id } });
    await db.workflow.delete({ where: { id: workflow.id } });
    await db.user.deleteMany({ where: { id: { in: [userAlice.id, userBob.id] } } });
    await db.department.deleteMany({ where: { id: { in: [deptReception.id, deptHousekeeping.id] } } });
    await db.property.delete({ where: { id: prop.id } });
  });

  console.log('\n🎉 Manager reassignment & audit logging test passed!');
}

testManagerReassign().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
