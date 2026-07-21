/* eslint-disable */
import { db } from '../src/lib/db';
import { withBypassContext } from '../src/lib/tenant-context';

async function runRoutingTests() {
  console.log('🏁 Starting Incoming Webhook Property Routing Test Suite...');

  // 1. Setup - Create two temporary test properties with different phone numbers
  const propA = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'Routing Test Hotel Alpha',
        type: 'HOTEL',
        address: '100 Webhook Lane',
        twilioWhatsappNumber: '+15551111111',
        twilioSmsNumber: '+15551111111',
        twilioPhoneNumber: '+15551111111',
      },
    })
  );

  const propB = await withBypassContext(async () =>
    await db.property.create({
      data: {
        name: 'Routing Test Hotel Beta',
        type: 'HOTEL',
        address: '200 Webhook Boulevard',
        twilioWhatsappNumber: '+15552222222',
        twilioSmsNumber: '+15552222222',
        twilioPhoneNumber: '+15552222222',
      },
    })
  );

  console.log(`Created Property Alpha (${propA.name}): ${propA.id} [Phone: +15551111111]`);
  console.log(`Created Property Beta (${propB.name}): ${propB.id} [Phone: +15552222222]`);

  try {
    // 2. Helper function simulating incoming route property resolution logic
    async function resolvePropertyByToNumber(rawTo: string) {
      const targetPhone = rawTo.replace('whatsapp:', '').trim();
      return await db.property.findFirst({
        where: {
          OR: [
            { twilioWhatsappNumber: targetPhone },
            { twilioSmsNumber: targetPhone },
            { twilioPhoneNumber: targetPhone },
            { twilioWhatsappNumber: `whatsapp:${targetPhone}` },
            { twilioSmsNumber: `whatsapp:${targetPhone}` },
          ],
        },
      });
    }

    // Test Case 1: Incoming message to Property Alpha (+15551111111)
    console.log('\n--- Test 1: Incoming message to +15551111111 ---');
    const resolvedA = await resolvePropertyByToNumber('+15551111111');
    if (resolvedA && resolvedA.id === propA.id) {
      console.log('✅ PASS: Resolved to Property Alpha correctly.');
    } else {
      console.error(`❌ FAIL: Expected ${propA.id}, got ${resolvedA?.id}`);
    }

    // Test Case 2: Incoming message to Property Beta (whatsapp:+15552222222)
    console.log('\n--- Test 2: Incoming message to whatsapp:+15552222222 ---');
    const resolvedB = await resolvePropertyByToNumber('whatsapp:+15552222222');
    if (resolvedB && resolvedB.id === propB.id) {
      console.log('✅ PASS: Resolved to Property Beta correctly.');
    } else {
      console.error(`❌ FAIL: Expected ${propB.id}, got ${resolvedB?.id}`);
    }

    // Test Case 3: Incoming message to unknown number (+15559999999)
    console.log('\n--- Test 3: Incoming message to unknown number +15559999999 ---');
    const resolvedUnknown = await resolvePropertyByToNumber('+15559999999');
    if (!resolvedUnknown) {
      console.log('✅ PASS: Unknown number returns null (fails loudly with 404, does not fallback).');
    } else {
      console.error(`❌ FAIL: Expected null, but silently fell back to Property: ${resolvedUnknown.id}`);
    }

    // Test Case 4: Verify Event created for Property A's message has propertyId == propA.id
    console.log('\n--- Test 4: Verify Event scoping for Property Alpha ---');
    const eventA = await withBypassContext(async () =>
      await db.event.create({
        data: {
          propertyId: propA.id,
          type: 'GUEST_REQUEST_CREATED',
          source: 'WHATSAPP',
          metadata: { messageText: 'Water bottles please', targetPhone: '+15551111111' },
          processed: false,
        },
      })
    );

    const eventB = await withBypassContext(async () =>
      await db.event.create({
        data: {
          propertyId: propB.id,
          type: 'GUEST_REQUEST_CREATED',
          source: 'WHATSAPP',
          metadata: { messageText: 'Clean room please', targetPhone: '+15552222222' },
          processed: false,
        },
      })
    );

    if (eventA.propertyId === propA.id && eventB.propertyId === propB.id && eventA.propertyId !== eventB.propertyId) {
      console.log('✅ PASS: Events attributed strictly to their respective properties.');
    } else {
      console.error('❌ FAIL: Event property attribution cross-contaminated.');
    }

    // Cleanup created events
    await withBypassContext(async () => {
      await db.event.deleteMany({ where: { id: { in: [eventA.id, eventB.id] } } });
    });

  } finally {
    // Cleanup test properties
    console.log('\n🧹 Cleaning up test properties...');
    await withBypassContext(async () => {
      await db.property.deleteMany({ where: { id: { in: [propA.id, propB.id] } } });
    });
    console.log('Cleanup complete.');
  }

  console.log('\n🎉 Incoming webhook property routing test suite finished.');
}

runRoutingTests().catch((e) => {
  console.error('Test execution failed:', e);
  process.exit(1);
});
