import { GeneralServerError } from "../../exceptions/GeneralServerError";
import { queryType } from "../../app";
import { MockDatabase } from "../../model/MockDatabase";
import { ItemAlreadyExistsError } from "../../exceptions/ItemAlreadyExistsError";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";
import ProductQueries from "../../queries/ProductQueries";

describe('ProductQueriesTest', () => {

    let product: ProductQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        product = new ProductQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
        db.setFailInsert(false);
        db.setDuplicateInsert(false);
        db.setIndexToUse(0);
    });

    //
    // ------------------------- Create statements test -------------------------
    //

    test("Create new product.", async () => {
        const promise = product.createNewProduct("product");
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test("Create duplicate product.", async () => {
        db.setDuplicateInsert(true);
        const promise = product.createNewProduct("product");
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test("Failure create duplicate product.", async () => {
        db.setFailInsert(true);
        const promise = product.createNewProduct("product");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("Retrieve all products.", async () => {
        const promise = product.getAllProducts();
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve all products in closed database.", async () => {
        db.setDBState(false);
        const promise = product.getAllProducts();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });


    test("Retrieve single product.", async () => {
        const promise = product.getProductByID("Joris");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve single product by ID.", async () => {
        const promise = product.getProductByID("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve single products in closed database.", async () => {
        db.setDBState(false);
        const promise = product.getProductByID("Joris");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test("Update product name.", async () => {
        const promise = product.updateProductNameByID("Joris", "newName");
        await expect(promise).resolves.toBeDefined();
    });

    test("Update product name by ID.", async () => {
        const promise = product.updateProductNameByID("1", "newName");
        await expect(promise).resolves.toBeDefined();
    });


    test("Update product name already exists.", async () => {
        db.setIndexToUse(1);
        const promise = product.updateProductNameByID("Joris", "newName");
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test("Update product name not found.", async () => {
        db.setIndexToUse(2);
        const promise = product.updateProductNameByID("Joris", "newName");
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test("Update product name failed.", async () => {
        db.setDBState(false);
        const promise = product.updateProductNameByID("Joris", "newName");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Archive product.", async () => {
        const promise = product.archiveProductByID("Joris", "true");
        await expect(promise).resolves.toBeDefined();
    });

    test("Unarchive product.", async () => {
        const promise = product.archiveProductByID("Joris", "false");
        await expect(promise).resolves.toBeDefined();
    });

    test("Archive product by ID.", async () => {
        const promise = product.archiveProductByID("1", "false");
        await expect(promise).resolves.toBeDefined();
    });


    test("Archive product already exists.", async () => {
        db.setIndexToUse(1);
        const promise = product.archiveProductByID("Joris", "false");
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test("Archive product not found.", async () => {
        db.setIndexToUse(2);
        const promise = product.archiveProductByID("Joris", "false");
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test("Archive product failed.", async () => {
        db.setDBState(false);
        const promise = product.archiveProductByID("Joris", "false");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test("Delete product.", async () => {
        const promise = product.deleteProductNameByID("Joris");
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete product by ID.", async () => {
        const promise = product.deleteProductNameByID("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete product failed.", async () => {
        db.setDBState(false);
        const promise = product.deleteProductNameByID("Joris");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});