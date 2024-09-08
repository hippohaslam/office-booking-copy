/**
 * Sorts two provided elements alphabetically taking into account any numbers in full.
 * This resolves the issue of string such as 'Desk 1' and 'Desk 11' being shown next to each other in an array.
 *  
 * **Example usage**
 * ```
 * const orderedObjects = bookableObjects.sort((a, b) => compareByPropertyWithNumbers(a, b, 'name'))
 * ```
 * @param a The first element for comparison (usually just 'a')
 * @param b The second element for comparison (usually just 'b')
 * @param property The property that you want to sort by (e.g. 'name')
 * @returns A number required by the `.sort` method.
 */
const compareAlphabeticallyByPropertyWithNumbers = <T>(a: T, b: T, property: keyof T): number => {
    const propA = String(a[property]).toLowerCase();
    const propB = String(b[property]).toLowerCase();

    // Extract numeric parts from the string values (if any)
    const numA = propA.match(/\d+/);
    const numB = propB.match(/\d+/);
  
    // If both have numbers, compare numerically
    if (numA && numB) {
      const diff = parseInt(numA[0], 10) - parseInt(numB[0], 10);
      if (diff !== 0) return diff; // If numbers differ, use numeric sorting
    }
  
    // Fallback to lexicographical comparison for non-numeric parts
    return propA.localeCompare(propB, undefined, { numeric: true });
};

export { compareAlphabeticallyByPropertyWithNumbers };