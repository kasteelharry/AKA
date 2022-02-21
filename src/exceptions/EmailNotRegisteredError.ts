/**
 * thrown when the email that is being checked is not registered in the database
 * status: 498
 */
export class EmailNotRegisteredError extends Error {
    public status: number;
    constructor (msg: string) {
        super(msg);
        this.status = 498;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, EmailNotRegisteredError.prototype);
    }
}
