/**
 * Tiny className combiner. Filters falsy values and joins with spaces.
 * Intentionally dependency-free.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
