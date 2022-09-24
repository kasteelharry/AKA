/**
 * thrown when the item that is being inserted in the database already exists.
 * status: 503
 */
export class ItemAlreadyExistsError extends Error {
    public status: number;
    constructor (msg?:string) {
        if (msg === undefined) {
            msg = 'Item already exists in the database or no value was changed.';
        }
        super(msg);
        this.status = 503;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ItemAlreadyExistsError.prototype);
    }
}
