/**
 * Check if a string is null, undefined or empty.
 * @param value The string to check.
 * @returns True if the string is null, undefined or empty; otherwise, false.
 */
function isNullOrEmpty(value: string | null | undefined): value is null | undefined | "" {
  return value === null || value === undefined || value.trim() === "";
}

/**
 * Converts a raw, unformatted label into a format that can be used in element attributes such as Ids.
 * 1. Changes the input label to lowercase
 * 2. Removes special characters
 * 3. Changes any whitespace to '-'
 * @param label Unformatted input label string
 * @returns Formatted Id string
 */
const sanitiseForId = (label: string) => {
  return label.toLowerCase().replace(/[^\w\s]|(\s+)/g, (_match: string, group1: string) => (group1 ? "-" : ""));
};

export { isNullOrEmpty, sanitiseForId };
