import { NextResponse } from 'next/server';
import { db } from './db';
import { withTenantContext, withBypassContext } from './tenant-context';

/**
 * Wraps an API request handler in the appropriate tenant context.
 * Resolves the property ID from request headers or falls back to the first active property in database.
 */
export async function withApiTenantContext(
  request: Request,
  handler: (propertyId: string) => Promise<Response>
): Promise<Response> {
  try {
    // 1. Resolve property ID from request headers
    let propertyId = request.headers.get('x-property-id');

    // 2. Fallback: Lookup default property using administrative bypass
    if (!propertyId) {
      propertyId = await withBypassContext(async () => {
        const defaultProp = await db.property.findFirst({
          where: { status: 'ACTIVE' },
        });
        return defaultProp?.id || null;
      });
    }

    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property context not found. Please verify database seeding.' },
        { status: 400 }
      );
    }

    // 3. Execute the handler inside the tenant context
    return await withTenantContext(propertyId, () => handler(propertyId));
  } catch (error) {
    console.error('API Tenant Context Execution Error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
