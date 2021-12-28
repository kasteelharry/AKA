export class ItemAlreadyExistsError extends Error {
    public status: number;
    constructor() {
        super('Item already exists in the database.');
        this.status = 403;

        // Set the prototype explicitly.
        Object.setPrototypeOf(this, ItemAlreadyExistsError.prototype);
    }
    

}