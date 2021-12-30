/**
 * This method converts the string it receives into a format that 
 * can be inserted into the MySQL database.
 * @param date string containing the date format.
 * @returns the string formatted for MySQL support.
 */
export function convertStringToSQLDate(date:string) {
    try {
        const dateOfBirth = new Date(date).toISOString();
        const isoDate = new Date(dateOfBirth);
        return isoDate.toJSON().slice(0, 19).replace('T', ' ');
    } catch {
        return undefined;
    }
}