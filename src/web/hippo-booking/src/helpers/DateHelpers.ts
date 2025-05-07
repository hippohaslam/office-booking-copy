/**
 * @returns {string} The date formatted as "day month year"
 */
export const toLocaleDateUk = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}