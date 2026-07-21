import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const tablesWithPropertyId = [
  'Department',
  'User',
  'Guest',
  'Room',
  'Booking',
  'Workflow',
  'Task',
  'Event',
  'Notification',
  'SOP',
  'Asset',
  'InventoryItem',
  'Vendor',
  'Comment',
  'Attachment',
  'AuditLog',
  'AIRecommendation',
];

async function main() {
  console.log('Starting Row-Level Security (RLS) database configuration (using PERMISSIVE policies)...');

  // 1. Configure the "Property" table (uses "id" as the tenant identifier)
  console.log('Enabling RLS on "Property" table...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "Property" FORCE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_policy ON "Property";`);
  await prisma.$executeRawUnsafe(`
    CREATE POLICY tenant_isolation_policy ON "Property"
    FOR ALL
    USING (
      current_setting('app.bypass_rls', true) = 'true'
      OR "id" = NULLIF(current_setting('app.current_property_id', true), '')
    )
    WITH CHECK (
      current_setting('app.bypass_rls', true) = 'true'
      OR "id" = NULLIF(current_setting('app.current_property_id', true), '')
    );
  `);

  // 2. Configure tables with "propertyId"
  for (const table of tablesWithPropertyId) {
    console.log(`Enabling RLS on "${table}" table...`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" FORCE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_policy ON "${table}";`);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_policy ON "${table}"
      FOR ALL
      USING (
        current_setting('app.bypass_rls', true) = 'true'
        OR "propertyId" = NULLIF(current_setting('app.current_property_id', true), '')
      )
      WITH CHECK (
        current_setting('app.bypass_rls', true) = 'true'
        OR "propertyId" = NULLIF(current_setting('app.current_property_id', true), '')
      );
    `);
  }

  // 3. Configure "SOPTaskTemplate" table (dependent on parent "SOP" table)
  console.log('Enabling RLS on "SOPTaskTemplate" table...');
  await prisma.$executeRawUnsafe(`ALTER TABLE "SOPTaskTemplate" ENABLE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "SOPTaskTemplate" FORCE ROW LEVEL SECURITY;`);
  await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_policy ON "SOPTaskTemplate";`);
  await prisma.$executeRawUnsafe(`
    CREATE POLICY tenant_isolation_policy ON "SOPTaskTemplate"
    FOR ALL
    USING (
      current_setting('app.bypass_rls', true) = 'true'
      OR EXISTS (
        SELECT 1 FROM "SOP"
        WHERE "SOP".id = "SOPTaskTemplate"."sopId"
          AND "SOP"."propertyId" = NULLIF(current_setting('app.current_property_id', true), '')
      )
    )
    WITH CHECK (
      current_setting('app.bypass_rls', true) = 'true'
      OR EXISTS (
        SELECT 1 FROM "SOP"
        WHERE "SOP".id = "SOPTaskTemplate"."sopId"
          AND "SOP"."propertyId" = NULLIF(current_setting('app.current_property_id', true), '')
      )
    );
  `);

  console.log('🎉 Row-Level Security (RLS) policies successfully configured on database with permissive policies!');
}

main()
  .catch((e) => {
    console.error('Error during RLS configuration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
