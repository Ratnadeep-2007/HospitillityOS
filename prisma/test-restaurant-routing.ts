/* eslint-disable */
import { extractTasksFromText } from '../src/lib/ai';
import { db } from '../src/lib/db';
import { withBypassContext } from '../src/lib/tenant-context';

async function testRestaurantRouting() {
  console.log('🏁 Starting Restaurant Department End-to-End Routing Test...');

  // 1. Verify AI intent extraction for restaurant booking request
  const testMessage = 'book a table for 4 at 7:30pm';
  console.log(`\nTesting guest message: "${testMessage}"`);

  const aiResult = await extractTasksFromText(testMessage, { roomNumber: '101' });
  console.log('AI Extraction Result:', JSON.stringify(aiResult, null, 2));

  const extractedTask = aiResult.tasks[0];
  if (extractedTask && extractedTask.departmentName === 'Restaurant') {
    console.log('✅ PASS: Message correctly identified for Restaurant department.');
  } else {
    console.error(`❌ FAIL: Expected department 'Restaurant', got '${extractedTask?.departmentName}'`);
    process.exit(1);
  }

  // 2. Setup property and Restaurant department in DB
  const prop = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'Restaurant Test Hotel',
        type: 'HOTEL',
        address: '777 Dining Row',
      },
    })
  );

  const restDept = await withBypassContext(async () =>
    await db.department.create({
      data: {
        propertyId: prop.id,
        name: 'Restaurant',
        description: 'Dining area and table bookings',
      },
    })
  );

  const workflow = await withBypassContext(async () =>
    await db.workflow.create({
      data: {
        propertyId: prop.id,
        type: 'GUEST_REQUEST',
        status: 'IN_PROGRESS',
      },
    })
  );

  // 3. Create Task under Restaurant department
  const task = await withBypassContext(async () =>
    await db.task.create({
      data: {
        propertyId: prop.id,
        workflowId: workflow.id,
        departmentId: restDept.id,
        title: extractedTask.title,
        description: extractedTask.description,
        priority: extractedTask.priority,
        status: 'PENDING',
      },
    })
  );

  console.log(`Created Task: ID=${task.id}, Title="${task.title}", Department=${restDept.name}`);

  // 4. Verify querying task by Restaurant department returns task
  const restaurantTasks = await withBypassContext(async () =>
    await db.task.findMany({
      where: { propertyId: prop.id, departmentId: restDept.id },
      include: { department: true },
    })
  );

  if (restaurantTasks.some((t) => t.id === task.id)) {
    console.log('✅ PASS: Task is visible in database under Restaurant department.');
  } else {
    console.error('❌ FAIL: Task not found under Restaurant department.');
    process.exit(1);
  }

  // Cleanup
  console.log('\n🧹 Cleaning up test data...');
  await withBypassContext(async () => {
    await db.task.delete({ where: { id: task.id } });
    await db.workflow.delete({ where: { id: workflow.id } });
    await db.department.delete({ where: { id: restDept.id } });
    await db.property.delete({ where: { id: prop.id } });
  });

  console.log('\n🎉 Restaurant department routing test completed successfully!');
}

testRestaurantRouting().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
