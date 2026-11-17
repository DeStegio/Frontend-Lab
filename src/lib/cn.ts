export type ClassValue = string | false | null | undefined | 0;

/** Joins truthy class names. Components avoid conflicting utilities, so no merge step is needed. */
export function cn(...values: ClassValue[]): string {
  return values.filter(Boolean).join(' ');
}
