/* eslint-disable */
import { db } from '../src/lib/db';
import { withTenantContext, withBypassContext } from '../src/lib/tenant-context';

interface TestResult {
  model: string;
  passed: boolean;
  message: string;
}

async function runFullRlsTestSuite() {
  console.log('🏁 Starting Comprehensive Multi-Tenant RLS Test Suite across ALL tenant-scoped models...\n');

  const results: TestResult[] = [];

  function logResult(model: string, passed: boolean, message: string) {
    results.push({ model, passed, message });
    if (passed) {
      console.log(`✅ [PASS] ${model.padEnd(20)}: ${message}`);
    } else {
      console.error(`❌ [FAIL] ${model.padEnd(20)}: ${message}`);
    }
  }

  // 1. Setup - Create test properties in bypass context
  const propA = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'RLS Full Test Property Alpha',
        type: 'HOTEL',
        address: '100 Isolation Way',
      },
    })
  );

  const propB = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'RLS Full Test Property Beta',
        type: 'HOTEL',
        address: '200 Isolation Way',
      },
    })
  );

  console.log(`Created Test Property Alpha: ${propA.id}`);
  console.log(`Created Test Property Beta:  ${propB.id}\n`);

  try {
    // --- 1. Department ---
    const deptA = await withTenantContext(propA.id, async () =>
      await db.department.create({ data: { propertyId: propA.id, name: 'Alpha Dept' } })
    );
    const deptB = await withTenantContext(propB.id, async () =>
      await db.department.create({ data: { propertyId: propB.id, name: 'Beta Dept' } })
    );

    const deptsInA = await withTenantContext(propA.id, async () => await db.department.findMany());
    const deptsInB = await withTenantContext(propB.id, async () => await db.department.findMany());
    const deptPass = deptsInA.some((d) => d.id === deptA.id) && !deptsInA.some((d) => d.id === deptB.id) &&
                     deptsInB.some((d) => d.id === deptB.id) && !deptsInB.some((d) => d.id === deptA.id);
    logResult('Department', deptPass, deptPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 2. User ---
    const userA = await withTenantContext(propA.id, async () =>
      await db.user.create({
        data: {
          propertyId: propA.id,
          departmentId: deptA.id,
          name: 'Alpha User',
          email: `alpha_${Date.now()}@test.com`,
          passwordHash: 'hash',
          role: 'STAFF',
        },
      })
    );
    const userB = await withTenantContext(propB.id, async () =>
      await db.user.create({
        data: {
          propertyId: propB.id,
          departmentId: deptB.id,
          name: 'Beta User',
          email: `beta_${Date.now()}@test.com`,
          passwordHash: 'hash',
          role: 'STAFF',
        },
      })
    );

    const usersInA = await withTenantContext(propA.id, async () => await db.user.findMany());
    const usersInB = await withTenantContext(propB.id, async () => await db.user.findMany());
    const userPass = usersInA.some((u) => u.id === userA.id) && !usersInA.some((u) => u.id === userB.id) &&
                     usersInB.some((u) => u.id === userB.id) && !usersInB.some((u) => u.id === userA.id);
    logResult('User', userPass, userPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 3. Guest ---
    const guestA = await withTenantContext(propA.id, async () =>
      await db.guest.create({ data: { propertyId: propA.id, name: 'Alpha Guest' } })
    );
    const guestB = await withTenantContext(propB.id, async () =>
      await db.guest.create({ data: { propertyId: propB.id, name: 'Beta Guest' } })
    );

    const guestsInA = await withTenantContext(propA.id, async () => await db.guest.findMany());
    const guestsInB = await withTenantContext(propB.id, async () => await db.guest.findMany());
    const guestPass = guestsInA.some((g) => g.id === guestA.id) && !guestsInA.some((g) => g.id === guestB.id) &&
                      guestsInB.some((g) => g.id === guestB.id) && !guestsInB.some((g) => g.id === guestA.id);
    logResult('Guest', guestPass, guestPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 4. Room ---
    const roomA = await withTenantContext(propA.id, async () =>
      await db.room.create({ data: { propertyId: propA.id, roomNumber: '101A', roomType: 'Standard' } })
    );
    const roomB = await withTenantContext(propB.id, async () =>
      await db.room.create({ data: { propertyId: propB.id, roomNumber: '101B', roomType: 'Standard' } })
    );

    const roomsInA = await withTenantContext(propA.id, async () => await db.room.findMany());
    const roomsInB = await withTenantContext(propB.id, async () => await db.room.findMany());
    const roomPass = roomsInA.some((r) => r.id === roomA.id) && !roomsInA.some((r) => r.id === roomB.id) &&
                     roomsInB.some((r) => r.id === roomB.id) && !roomsInB.some((r) => r.id === roomA.id);
    logResult('Room', roomPass, roomPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 5. Booking ---
    const bookingA = await withTenantContext(propA.id, async () =>
      await db.booking.create({
        data: {
          propertyId: propA.id,
          guestId: guestA.id,
          roomId: roomA.id,
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 86400000),
        },
      })
    );
    const bookingB = await withTenantContext(propB.id, async () =>
      await db.booking.create({
        data: {
          propertyId: propB.id,
          guestId: guestB.id,
          roomId: roomB.id,
          checkIn: new Date(),
          checkOut: new Date(Date.now() + 86400000),
        },
      })
    );

    const bookingsInA = await withTenantContext(propA.id, async () => await db.booking.findMany());
    const bookingsInB = await withTenantContext(propB.id, async () => await db.booking.findMany());
    const bookingPass = bookingsInA.some((b) => b.id === bookingA.id) && !bookingsInA.some((b) => b.id === bookingB.id) &&
                        bookingsInB.some((b) => b.id === bookingB.id) && !bookingsInB.some((b) => b.id === bookingA.id);
    logResult('Booking', bookingPass, bookingPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 6. Workflow ---
    const workflowA = await withTenantContext(propA.id, async () =>
      await db.workflow.create({ data: { propertyId: propA.id, bookingId: bookingA.id, type: 'GUEST_REQUEST' } })
    );
    const workflowB = await withTenantContext(propB.id, async () =>
      await db.workflow.create({ data: { propertyId: propB.id, bookingId: bookingB.id, type: 'GUEST_REQUEST' } })
    );

    const workflowsInA = await withTenantContext(propA.id, async () => await db.workflow.findMany());
    const workflowsInB = await withTenantContext(propB.id, async () => await db.workflow.findMany());
    const workflowPass = workflowsInA.some((w) => w.id === workflowA.id) && !workflowsInA.some((w) => w.id === workflowB.id) &&
                         workflowsInB.some((w) => w.id === workflowB.id) && !workflowsInB.some((w) => w.id === workflowA.id);
    logResult('Workflow', workflowPass, workflowPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 7. Task ---
    const taskA = await withTenantContext(propA.id, async () =>
      await db.task.create({
        data: {
          propertyId: propA.id,
          workflowId: workflowA.id,
          departmentId: deptA.id,
          title: 'Alpha Clean Task',
        },
      })
    );
    const taskB = await withTenantContext(propB.id, async () =>
      await db.task.create({
        data: {
          propertyId: propB.id,
          workflowId: workflowB.id,
          departmentId: deptB.id,
          title: 'Beta Clean Task',
        },
      })
    );

    const tasksInA = await withTenantContext(propA.id, async () => await db.task.findMany());
    const tasksInB = await withTenantContext(propB.id, async () => await db.task.findMany());
    const taskPass = tasksInA.some((t) => t.id === taskA.id) && !tasksInA.some((t) => t.id === taskB.id) &&
                     tasksInB.some((t) => t.id === taskB.id) && !tasksInB.some((t) => t.id === taskA.id);
    logResult('Task', taskPass, taskPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 8. Event ---
    const eventA = await withTenantContext(propA.id, async () =>
      await db.event.create({
        data: {
          propertyId: propA.id,
          type: 'TEST_EVENT',
          source: 'SYSTEM',
          metadata: { text: 'Alpha event' },
        },
      })
    );
    const eventB = await withTenantContext(propB.id, async () =>
      await db.event.create({
        data: {
          propertyId: propB.id,
          type: 'TEST_EVENT',
          source: 'SYSTEM',
          metadata: { text: 'Beta event' },
        },
      })
    );

    const eventsInA = await withTenantContext(propA.id, async () => await db.event.findMany());
    const eventsInB = await withTenantContext(propB.id, async () => await db.event.findMany());
    const eventPass = eventsInA.some((e) => e.id === eventA.id) && !eventsInA.some((e) => e.id === eventB.id) &&
                      eventsInB.some((e) => e.id === eventB.id) && !eventsInB.some((e) => e.id === eventA.id);
    logResult('Event', eventPass, eventPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 9. Notification ---
    const notifA = await withTenantContext(propA.id, async () =>
      await db.notification.create({
        data: {
          propertyId: propA.id,
          userId: userA.id,
          channel: 'IN_APP',
          recipient: userA.email,
          message: 'Alpha notification',
        },
      })
    );
    const notifB = await withTenantContext(propB.id, async () =>
      await db.notification.create({
        data: {
          propertyId: propB.id,
          userId: userB.id,
          channel: 'IN_APP',
          recipient: userB.email,
          message: 'Beta notification',
        },
      })
    );

    const notifsInA = await withTenantContext(propA.id, async () => await db.notification.findMany());
    const notifsInB = await withTenantContext(propB.id, async () => await db.notification.findMany());
    const notifPass = notifsInA.some((n) => n.id === notifA.id) && !notifsInA.some((n) => n.id === notifB.id) &&
                      notifsInB.some((n) => n.id === notifB.id) && !notifsInB.some((n) => n.id === notifA.id);
    logResult('Notification', notifPass, notifPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 10. SOP ---
    const sopA = await withTenantContext(propA.id, async () =>
      await db.sOP.create({ data: { propertyId: propA.id, name: 'Alpha SOP', schedule: '0 8 * * *' } })
    );
    const sopB = await withTenantContext(propB.id, async () =>
      await db.sOP.create({ data: { propertyId: propB.id, name: 'Beta SOP', schedule: '0 8 * * *' } })
    );

    const sopsInA = await withTenantContext(propA.id, async () => await db.sOP.findMany());
    const sopsInB = await withTenantContext(propB.id, async () => await db.sOP.findMany());
    const sopPass = sopsInA.some((s) => s.id === sopA.id) && !sopsInA.some((s) => s.id === sopB.id) &&
                    sopsInB.some((s) => s.id === sopB.id) && !sopsInB.some((s) => s.id === sopA.id);
    logResult('SOP', sopPass, sopPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 11. Asset ---
    const assetA = await withTenantContext(propA.id, async () =>
      await db.asset.create({ data: { propertyId: propA.id, name: 'Alpha Generator', category: 'Power', status: 'OPERATIONAL' } })
    );
    const assetB = await withTenantContext(propB.id, async () =>
      await db.asset.create({ data: { propertyId: propB.id, name: 'Beta Generator', category: 'Power', status: 'OPERATIONAL' } })
    );

    const assetsInA = await withTenantContext(propA.id, async () => await db.asset.findMany());
    const assetsInB = await withTenantContext(propB.id, async () => await db.asset.findMany());
    const assetPass = assetsInA.some((a) => a.id === assetA.id) && !assetsInA.some((a) => a.id === assetB.id) &&
                      assetsInB.some((a) => a.id === assetB.id) && !assetsInB.some((a) => a.id === assetA.id);
    logResult('Asset', assetPass, assetPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 12. InventoryItem ---
    const invA = await withTenantContext(propA.id, async () =>
      await db.inventoryItem.create({
        data: { propertyId: propA.id, departmentId: deptA.id, name: 'Alpha Soap', unit: 'units', quantity: 10, minimumLevel: 5 },
      })
    );
    const invB = await withTenantContext(propB.id, async () =>
      await db.inventoryItem.create({
        data: { propertyId: propB.id, departmentId: deptB.id, name: 'Beta Soap', unit: 'units', quantity: 10, minimumLevel: 5 },
      })
    );

    const invInA = await withTenantContext(propA.id, async () => await db.inventoryItem.findMany());
    const invInB = await withTenantContext(propB.id, async () => await db.inventoryItem.findMany());
    const invPass = invInA.some((i) => i.id === invA.id) && !invInA.some((i) => i.id === invB.id) &&
                    invInB.some((i) => i.id === invB.id) && !invInB.some((i) => i.id === invA.id);
    logResult('InventoryItem', invPass, invPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 13. Vendor ---
    const vendorA = await withTenantContext(propA.id, async () =>
      await db.vendor.create({ data: { propertyId: propA.id, name: 'Alpha Vendor', category: 'Food', contactInfo: 'a@v.com' } })
    );
    const vendorB = await withTenantContext(propB.id, async () =>
      await db.vendor.create({ data: { propertyId: propB.id, name: 'Beta Vendor', category: 'Food', contactInfo: 'b@v.com' } })
    );

    const vendorsInA = await withTenantContext(propA.id, async () => await db.vendor.findMany());
    const vendorsInB = await withTenantContext(propB.id, async () => await db.vendor.findMany());
    const vendorPass = vendorsInA.some((v) => v.id === vendorA.id) && !vendorsInA.some((v) => v.id === vendorB.id) &&
                       vendorsInB.some((v) => v.id === vendorB.id) && !vendorsInB.some((v) => v.id === vendorA.id);
    logResult('Vendor', vendorPass, vendorPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 14. Comment ---
    const commentA = await withTenantContext(propA.id, async () =>
      await db.comment.create({ data: { propertyId: propA.id, taskId: taskA.id, userId: userA.id, message: 'Alpha comment' } })
    );
    const commentB = await withTenantContext(propB.id, async () =>
      await db.comment.create({ data: { propertyId: propB.id, taskId: taskB.id, userId: userB.id, message: 'Beta comment' } })
    );

    const commentsInA = await withTenantContext(propA.id, async () => await db.comment.findMany());
    const commentsInB = await withTenantContext(propB.id, async () => await db.comment.findMany());
    const commentPass = commentsInA.some((c) => c.id === commentA.id) && !commentsInA.some((c) => c.id === commentB.id) &&
                        commentsInB.some((c) => c.id === commentB.id) && !commentsInB.some((c) => c.id === commentA.id);
    logResult('Comment', commentPass, commentPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 15. Attachment ---
    const attachA = await withTenantContext(propA.id, async () =>
      await db.attachment.create({ data: { propertyId: propA.id, taskId: taskA.id, fileUrl: 'http://a.com/f.png', uploadedByUserId: userA.id } })
    );
    const attachB = await withTenantContext(propB.id, async () =>
      await db.attachment.create({ data: { propertyId: propB.id, taskId: taskB.id, fileUrl: 'http://b.com/f.png', uploadedByUserId: userB.id } })
    );

    const attachesInA = await withTenantContext(propA.id, async () => await db.attachment.findMany());
    const attachesInB = await withTenantContext(propB.id, async () => await db.attachment.findMany());
    const attachPass = attachesInA.some((a) => a.id === attachA.id) && !attachesInA.some((a) => a.id === attachB.id) &&
                       attachesInB.some((a) => a.id === attachB.id) && !attachesInB.some((a) => a.id === attachA.id);
    logResult('Attachment', attachPass, attachPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 16. AuditLog ---
    const auditA = await withTenantContext(propA.id, async () =>
      await db.auditLog.create({ data: { propertyId: propA.id, userId: userA.id, action: 'TEST_ACTION_A', entityType: 'Task', entityId: taskA.id } })
    );
    const auditB = await withTenantContext(propB.id, async () =>
      await db.auditLog.create({ data: { propertyId: propB.id, userId: userB.id, action: 'TEST_ACTION_B', entityType: 'Task', entityId: taskB.id } })
    );

    const auditsInA = await withTenantContext(propA.id, async () => await db.auditLog.findMany());
    const auditsInB = await withTenantContext(propB.id, async () => await db.auditLog.findMany());
    const auditPass = auditsInA.some((a) => a.id === auditA.id) && !auditsInA.some((a) => a.id === auditB.id) &&
                      auditsInB.some((a) => a.id === auditB.id) && !auditsInB.some((a) => a.id === auditA.id);
    logResult('AuditLog', auditPass, auditPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

    // --- 17. AIRecommendation ---
    const recA = await withTenantContext(propA.id, async () =>
      await db.aIRecommendation.create({ data: { propertyId: propA.id, eventId: eventA.id, type: 'STAFF_MOVE', confidence: 0.9, reason: 'Alpha rec' } })
    );
    const recB = await withTenantContext(propB.id, async () =>
      await db.aIRecommendation.create({ data: { propertyId: propB.id, eventId: eventB.id, type: 'STAFF_MOVE', confidence: 0.8, reason: 'Beta rec' } })
    );

    const recsInA = await withTenantContext(propA.id, async () => await db.aIRecommendation.findMany());
    const recsInB = await withTenantContext(propB.id, async () => await db.aIRecommendation.findMany());
    const recPass = recsInA.some((r) => r.id === recA.id) && !recsInA.some((r) => r.id === recB.id) &&
                    recsInB.some((r) => r.id === recB.id) && !recsInB.some((r) => r.id === recA.id);
    logResult('AIRecommendation', recPass, recPass ? 'Strict tenant isolation verified' : 'Cross-tenant leak detected');

  } finally {
    console.log('\n🧹 Cleaning up test properties and all associated test records...');
    await withBypassContext(async () => {
      await db.aIRecommendation.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.auditLog.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.attachment.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.comment.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.vendor.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.inventoryItem.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.asset.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.sOP.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.notification.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.event.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.task.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.workflow.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.booking.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.room.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.guest.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.user.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.department.deleteMany({ where: { propertyId: { in: [propA.id, propB.id] } } });
      await db.property.deleteMany({ where: { id: { in: [propA.id, propB.id] } } });
    });
    console.log('Cleanup complete.');
  }

  console.log('\n========================================');
  console.log(`SUMMARY: ${results.filter(r => r.passed).length} / ${results.length} MODELS PASSED RLS ISOLATION`);
  console.log('========================================');

  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.error(`\nFAILED MODELS (${failed.length}):`);
    failed.forEach(f => console.error(` - ${f.model}: ${f.message}`));
    process.exit(1);
  } else {
    console.log('\n🎉 ALL TENANT-SCOPED MODELS PASSED MULTI-TENANT ISOLATION TESTS SUCCESSFULLY!');
  }
}

runFullRlsTestSuite().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
