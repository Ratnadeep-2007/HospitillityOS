/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { getTenantId, isRlsBypassed } from './tenant-context';
import { AsyncLocalStorage } from 'async_hooks';

// AsyncLocalStorage to keep track of whether we are currently executing inside a transaction.
// This prevents infinite recursion when wrapping queries in a transaction block.
const transactionStore = new AsyncLocalStorage<boolean>();

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const baseDb = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = baseDb;

// Export the extended Prisma Client that automatically applies tenant isolation
export const db = baseDb.$extends({
  client: {
    async $transaction<T>(
      this: any,
      arg: any,
      options?: any
    ): Promise<T> {
      const propertyId = getTenantId();
      const bypassed = isRlsBypassed();

      if (bypassed) {
        // 1. Array of queries: db.$transaction([q1, q2])
        if (Array.isArray(arg)) {
          return transactionStore.run(true, async () => {
            return baseDb.$transaction([
              baseDb.$executeRawUnsafe(`SET LOCAL app.bypass_rls = 'true'`),
              ...arg
            ], options) as unknown as Promise<T>;
          }) as unknown as Promise<T>;
        }

        // 2. Interactive transaction: db.$transaction(async (tx) => { ... })
        return transactionStore.run(true, async () => {
          return baseDb.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.bypass_rls = 'true'`);
            return arg(tx);
          }, options);
        }) as unknown as Promise<T>;
      }

      if (!propertyId) {
        // If there is no tenant context and not bypassed, run standard transaction without setting session variables
        return baseDb.$transaction(arg, options) as unknown as Promise<T>;
      }

      // 1. Array of queries: db.$transaction([q1, q2])
      if (Array.isArray(arg)) {
        return transactionStore.run(true, async () => {
          return baseDb.$transaction([
            baseDb.$executeRawUnsafe(`SET LOCAL app.current_property_id = ${JSON.stringify(propertyId)}`),
            ...arg
          ], options) as unknown as Promise<T>;
        }) as unknown as Promise<T>;
      }

      // 2. Interactive transaction: db.$transaction(async (tx) => { ... })
      return transactionStore.run(true, async () => {
        return baseDb.$transaction(async (tx) => {
          await tx.$executeRawUnsafe(`SET LOCAL app.current_property_id = ${JSON.stringify(propertyId)}`);
          return arg(tx);
        }, options);
      }) as unknown as Promise<T>;
    }
  },
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const propertyId = getTenantId();
        const bypassed = isRlsBypassed();

        // --- RLS BYPASS ROUTE ---
        if (bypassed) {
          const inTransaction = transactionStore.getStore();
          if (inTransaction) {
            return query(args);
          }
          return transactionStore.run(true, () => {
            return baseDb.$transaction(async (tx) => {
              await tx.$executeRawUnsafe(`SET LOCAL app.bypass_rls = 'true'`);
              // Route the query execution through the transaction client
              const prismaModelName = model.charAt(0).toLowerCase() + model.slice(1);
              return (tx as any)[prismaModelName][operation](args);
            });
          });
        }

        // If no tenant context is established, execute the query as is (e.g. for background system actions or seeding)
        if (!propertyId) {
          return query(args);
        }

        const updatedArgs = { ...args } as any;

        // --- SECTION 1: Client-Side Tenant Filtering (Safety Net) ---
        
        // Apply propertyId filter to all Read, Update, and Delete operations
        if (
          operation === 'findUnique' ||
          operation === 'findUniqueOrThrow' ||
          operation === 'findFirst' ||
          operation === 'findFirstOrThrow' ||
          operation === 'findMany' ||
          operation === 'update' ||
          operation === 'updateMany' ||
          operation === 'delete' ||
          operation === 'deleteMany' ||
          operation === 'count' ||
          operation === 'aggregate' ||
          operation === 'groupBy'
        ) {
          updatedArgs.where = updatedArgs.where || {};
          if (model === 'Property') {
            updatedArgs.where.id = propertyId;
          } else if (model === 'SOPTaskTemplate') {
            // SOPTaskTemplate has no direct propertyId, we filter via the SOP relation
            updatedArgs.where.sop = updatedArgs.where.sop || {};
            updatedArgs.where.sop.propertyId = propertyId;
          } else {
            updatedArgs.where.propertyId = propertyId;
          }
        }

        // Apply propertyId injection to Create operations
        if (operation === 'create') {
          updatedArgs.data = updatedArgs.data || {};
          if (model !== 'Property' && model !== 'SOPTaskTemplate') {
            updatedArgs.data.propertyId = propertyId;
          }
        }

        // Apply propertyId injection to CreateMany operations
        if (operation === 'createMany') {
          if (model !== 'Property' && model !== 'SOPTaskTemplate') {
            if (Array.isArray(updatedArgs.data)) {
              updatedArgs.data = updatedArgs.data.map((item: any) => ({
                ...item,
                propertyId,
              }));
            } else if (updatedArgs.data) {
              updatedArgs.data.propertyId = propertyId;
            }
          }
        }

        // Apply propertyId injection/filtering to Upsert operations
        if (operation === 'upsert') {
          updatedArgs.where = updatedArgs.where || {};
          if (model === 'Property') {
            updatedArgs.where.id = propertyId;
            updatedArgs.create = updatedArgs.create || {};
            updatedArgs.create.id = propertyId;
            updatedArgs.update = updatedArgs.update || {};
          } else if (model === 'SOPTaskTemplate') {
            updatedArgs.where.sop = updatedArgs.where.sop || {};
            updatedArgs.where.sop.propertyId = propertyId;
          } else {
            updatedArgs.where.propertyId = propertyId;
            updatedArgs.create = updatedArgs.create || {};
            updatedArgs.create.propertyId = propertyId;
            updatedArgs.update = updatedArgs.update || {};
            updatedArgs.update.propertyId = propertyId;
          }
        }

        // --- SECTION 2: Database-Level RLS Enforcement ---
        
        // If we are already running inside an active transaction, execute the query immediately
        // (the transaction-level wrapper already set the local session variable).
        const inTransaction = transactionStore.getStore();
        if (inTransaction) {
          return query(updatedArgs);
        }

        // If not in a transaction, wrap this single operation in a lightweight transaction block
        // to set the local session variable, ensuring Postgres-level RLS policies are triggered.
        return transactionStore.run(true, () => {
          return baseDb.$transaction(async (tx) => {
            await tx.$executeRawUnsafe(`SET LOCAL app.current_property_id = ${JSON.stringify(propertyId)}`);
            // Route the query execution through the transaction client
            const prismaModelName = model.charAt(0).toLowerCase() + model.slice(1);
            return (tx as any)[prismaModelName][operation](updatedArgs);
          });
        });
      },
    },
  },
});
