/* eslint-disable */
import { db } from '../src/lib/db';
import { withBypassContext } from '../src/lib/tenant-context';

async function main() {
  await withBypassContext(async () => {
    console.log('Querying pg_policies to inspect active policies...');
    const policies = await db.$queryRawUnsafe(`
      SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check 
      FROM pg_policies 
      WHERE tablename = 'Property' OR tablename = 'Task';
    `) as any[];
    
    console.log('\nActive RLS Policies:');
    policies.forEach(p => {
      console.log(` - Table: ${p.tablename}`);
      console.log(`   Policy Name: ${p.policyname}`);
      console.log(`   Command: ${p.cmd}`);
      console.log(`   Roles: ${p.roles}`);
      console.log(`   Qual (USING): ${p.qual}`);
      console.log(`   With Check (WITH CHECK): ${p.with_check}`);
    });
  });
}

main().catch(console.error);
