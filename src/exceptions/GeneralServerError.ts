/**
 * thrown whenever another error does not apply to the condition that needs to return an error.
 * status: 500
 */
export class GeneralServerError extends Error {
    public status: number;
    constructor(msg: string) {
        super(msg);
        this.status = 500;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, GeneralServerError.prototype);
    }


}