import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { MockDatabase } from '@dir/model/MockDatabase';
import CategoryQueries from '@dir/queries/CategoryQueries';

describe('Test category queries', () => {
    let category: CategoryQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        category = new CategoryQueries(db);
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
    test('Create new category.', async () => {
        const promise = category.createNewCategory('product');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate category.', async () => {
        db.setDuplicateInsert(true);
        const promise = category.createNewCategory('product');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Failure create duplicate product.', async () => {
        db.setFailInsert(true);
        const promise = category.createNewCategory('product');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Set category.', async () => {
        const promise = category.setProductCategory('product', 'category');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Set category with product id.', async () => {
        const promise = category.setProductCategory('1', 'category');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate category.', async () => {
        db.setDuplicateInsert(true);
        const promise = category.setProductCategory('product', '2');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Failure create duplicate product.', async () => {
        db.setFailInsert(true);
        const promise = category.setProductCategory('1', '1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Retrieve all categories.', async () => {
        const promise = category.getAllCategories();
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all categories on closed database.', async () => {
        db.setDBState(false);
        const promise = category.getAllCategories();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all categories and products.', async () => {
        const promise = category.getAllCategoriesAndProducts();
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all categories and products on closed database.', async () => {
        db.setDBState(false);
        const promise = category.getAllCategoriesAndProducts();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve single category.', async () => {
        const promise = category.getSingleCategory('product');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single category.', async () => {
        const promise = category.getSingleCategory('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single category on closed database.', async () => {
        db.setDBState(false);
        const promise = category.getSingleCategory('product');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('Update category', async () => {
        const promise = category.updateCategoryName('product', 'F1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update category by id', async () => {
        const promise = category.updateCategoryName('1', 'F1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update category that already exists', async () => {
        db.setIndexToUse(1);
        const promise = category.updateCategoryName('product', 'F1');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update category that does not exists', async () => {
        db.setIndexToUse(2);
        const promise = category.updateCategoryName('product', 'F1');
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update category on closed database', async () => {
        db.setDBState(false);
        const promise = category.updateCategoryName('product', 'F1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Archive category', async () => {
        const promise = category.archiveCategory('product', 'true');
        await expect(promise).resolves.toBeDefined();
    });

    test('Archive category by id', async () => {
        const promise = category.archiveCategory('1', 'true');
        await expect(promise).resolves.toBeDefined();
    });

    test('Fail archive category by id', async () => {
        const promise = category.archiveCategory('1', 'lmao');
        await expect(promise).resolves.toBeDefined();
    });

    test('Archive category that already exists', async () => {
        db.setIndexToUse(1);
        const promise = category.archiveCategory('1', 'true');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Archive category that does not exists', async () => {
        db.setIndexToUse(2);
        const promise = category.archiveCategory('1', 'true');
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Archive category on closed database', async () => {
        db.setDBState(false);
        const promise = category.archiveCategory('1', 'true');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Delete category', async () => {
        const promise = category.deleteCategory('product');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete category by ID', async () => {
        const promise = category.deleteCategory('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete category on closed database', async () => {
        db.setDBState(false);
        const promise = category.deleteCategory('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Delete product category by ID', async () => {
        const promise = category.deleteProductCategory(1, 1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete product category on closed database', async () => {
        db.setDBState(false);
        const promise = category.deleteProductCategory(1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
