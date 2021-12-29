export class ItemAlreadyExistsError extends Error {
    public status: number;
    constructor() {
        super('Item already exists in the database or no value was changed.');
        this.status = 403;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ItemAlreadyExistsError.prototype);
    }
    

}