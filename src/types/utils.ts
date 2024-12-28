/**
 * Utility types for type transformations and safety
 */

// Make all properties optional and nullable
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P] | null | undefined;
};

// Require at least one property from a type
export type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];

// Exclude null and undefined from a type
export type NonNullable<T> = T extends null | undefined ? never : T;

// Create a type with all properties made strictly required
export type StrictRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

// Utility to convert optional properties to required
export type RequiredProps<T> = {
  [K in keyof T]-?: T[K];
};

// Utility to convert required properties to optional
export type PartialProps<T> = {
  [K in keyof T]+?: T[K];
};

// Safely get a nested property without throwing errors
export function safeGet<T, K extends keyof T>(obj: T, key: K): T[K] | undefined {
  return obj?.[key];
}

// Safely get a nested property with a default value
export function safeGetWithDefault<T, K extends keyof T>(
  obj: T, 
  key: K, 
  defaultValue: NonNullable<T[K]>
): NonNullable<T[K]> {
  return obj?.[key] ?? defaultValue;
}
