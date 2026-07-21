import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  propertyId: string;
}

// Store AsyncLocalStorage instances on the Node global object to prevent 
// duplication issues (dual-package hazard) in mixed CommonJS/ESM compilation environments.
const globalForContext = global as unknown as {
  tenantContextStorage?: AsyncLocalStorage<TenantContext>;
  rlsBypassStorage?: AsyncLocalStorage<boolean>;
};

export const tenantContextStorage = globalForContext.tenantContextStorage || new AsyncLocalStorage<TenantContext>();
export const rlsBypassStorage = globalForContext.rlsBypassStorage || new AsyncLocalStorage<boolean>();

// Ensure globals are assigned in development and script environments
globalForContext.tenantContextStorage = tenantContextStorage;
globalForContext.rlsBypassStorage = rlsBypassStorage;

/**
 * Retrieves the propertyId of the current tenant context.
 * Returns undefined if no context has been established for this execution path.
 */
export function getTenantId(): string | undefined {
  return tenantContextStorage.getStore()?.propertyId;
}

/**
 * Checks if the current execution context has RLS bypassed.
 */
export function isRlsBypassed(): boolean {
  return rlsBypassStorage.getStore() === true;
}

/**
 * Runs a function within the specified tenant context.
 */
export function withTenantContext<T>(propertyId: string, fn: () => T | Promise<T>): T | Promise<T> {
  return tenantContextStorage.run({ propertyId }, fn);
}

/**
 * Runs a function with RLS bypassed (system-level administrative action).
 */
export function withBypassContext<T>(fn: () => T | Promise<T>): T | Promise<T> {
  return rlsBypassStorage.run(true, fn);
}
