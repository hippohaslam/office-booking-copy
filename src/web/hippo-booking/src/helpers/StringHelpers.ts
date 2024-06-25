
/**
 * Check if a string is null, undefined or empty.
 * @param value The string to check.
 * @returns True if the string is null, undefined or empty; otherwise, false.
 */
function isNullOrEmpty(value?: string): boolean {
  return value === null || value === undefined || value === '';
}

export { isNullOrEmpty };