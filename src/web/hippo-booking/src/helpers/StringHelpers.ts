
/**
 * Check if a string is null, undefined or empty.
 * @param value The string to check.
 * @returns True if the string is null, undefined or empty; otherwise, false.
 */
function isNullOrEmpty(value: string | null | undefined): value is null | undefined | '' {
  return value === null || value === undefined || value.trim() === '';
}

export { isNullOrEmpty };