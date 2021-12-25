export class UnexpectedSQLResultError extends Error {
    public status: number
    constructor(msg: string) {
        super(msg)
        this.status = 500

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, UnexpectedSQLResultError.prototype);
    }
    

}