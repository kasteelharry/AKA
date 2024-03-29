/**
 * thrown when the SQL database returns an error.
 * status: 502
 */
export class UnexpectedSQLResultError extends Error {
    public status: number;
    constructor (msg: string) {
        super(msg);
        this.status = 502;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnexpectedSQLResultError.prototype);
    }
}
