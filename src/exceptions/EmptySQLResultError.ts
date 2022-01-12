export class EmptySQLResultError extends Error {
    public status: number;
    constructor(msg: string) {
        super(msg);
        this.status = 204;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, EmptySQLResultError.prototype);
    }


}