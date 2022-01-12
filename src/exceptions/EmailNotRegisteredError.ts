export class EmailNotRegisteredError extends Error {
    public status: number;
    constructor(msg: string) {
        super(msg);
        this.status = 498;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, EmailNotRegisteredError.prototype);
    }


}