import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { MockDatabase } from '@dir/model/MockDatabase';
import SalesQueries from '@dir/queries/SalesQueries';
import { convertStringToSQLDate } from '@dir/util/ConvertStringToSQLDate';

describe('SalesQueries', () => {
    let sale: SalesQueries;
    let db: MockDatabase<queryType>;
    const ts = convertStringToSQLDate('2000-12-12');
    if (ts === undefined) {
        return;
    }
    beforeAll(() => {
        db = new MockDatabase();
        sale = new SalesQueries(db);
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
    test('Create new sale.', async () => {
        const promise = sale.createSale(1, 1, 1);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create new sale with timestamp.', async () => {
        const promise = sale.createSale(1, 1, 1, convertStringToSQLDate('2000'));
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate sale.', async () => {
        db.setDuplicateInsert(true);
        const promise = sale.createSale(1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Failure create duplicate product.', async () => {
        db.setFailInsert(true);
        const promise = sale.createSale(1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Create new user sale.', async () => {
        const promise = sale.createCustomerSale('1', 1, 1, 1);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create new sale with timestamp.', async () => {
        const promise = sale.createCustomerSale('1', 1, 1, 1, convertStringToSQLDate('2000'));
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate sale.', async () => {
        db.setDuplicateInsert(true);
        const promise = sale.createCustomerSale('1', 1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Failure create duplicate product.', async () => {
        db.setFailInsert(true);
        const promise = sale.createCustomerSale('1', 1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Create new user sale with multiple products.', async () => {
        const promise = sale.createCombinedCustomerSale('1', 1, [{ id: 1, amount: 1 }, { id: 2, amount: 2 }]);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create new sale with timestamps and multiple products.', async () => {
        const promise = sale.createCombinedCustomerSale('1', 1, [{ id: 1, amount: 1, timestamp: convertStringToSQLDate(2000) }, { id: 2, amount: 2, timestamp: convertStringToSQLDate(2000) }]);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate sale.', async () => {
        db.setDuplicateInsert(true);
        const promise = sale.createCombinedCustomerSale('1', 1, [{ id: 1, amount: 1 }, { id: 2, amount: 2 }]);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Failure create duplicate product.', async () => {
        db.setFailInsert(true);
        const promise = sale.createCombinedCustomerSale('1', 1, [{ id: 1, amount: 1 }, { id: 2, amount: 2 }]);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Retrieve all sales.', async () => {
        const promise = sale.getAllSales();
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all sales on closed database.', async () => {
        db.setDBState(false);
        const promise = sale.getAllSales();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all sales by event.', async () => {
        const promise = sale.getAllSalesEvent(1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all sales by event on closed database.', async () => {
        db.setDBState(false);
        const promise = sale.getAllSalesEvent(1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all sales by single customer.', async () => {
        const promise = sale.getAllSalesByUser(1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all sales by single customer on closed database.', async () => {
        db.setDBState(false);
        const promise = sale.getAllSalesByUser(1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all sales by single customer and event.', async () => {
        const promise = sale.getAllSalesByUserAndEvent(1, 1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all sales by single customer and event on closed database.', async () => {
        db.setDBState(false);
        const promise = sale.getAllSalesByUserAndEvent(1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all sales by timestamp.', async () => {
        const promise = sale.getSaleByTimeStamp(ts);
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all sales by timestamp on closed database.', async () => {
        db.setDBState(false);
        const promise = sale.getSaleByTimeStamp(ts);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all sales by timestamp interval.', async () => {
        const promise = sale.getSaleByTimeStampInterval(ts, ts);
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all sales by timestamp on closed database.', async () => {
        db.setDBState(false);
        const promise = sale.getSaleByTimeStampInterval(ts, ts);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('Update sale', async () => {
        expect.assertions(1);
        const promise = sale.updateSale('1', 1, 1, 1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update sale that already exists', async () => {
        db.setIndexToUse(1);
        expect.assertions(1);
        const promise = sale.updateSale('1', 1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update sale that does not exists', async () => {
        db.setIndexToUse(2);
        expect.assertions(1);
        const promise = sale.updateSale('1', 1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update sale on closed database', async () => {
        db.setDBState(false);
        expect.assertions(1);
        const promise = sale.updateSale('1', 1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Update customer sale', async () => {
        expect.assertions(1);
        const promise = sale.updateUserSale('1', 1, 1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update customer sale that already exists', async () => {
        db.setIndexToUse(1);
        expect.assertions(1);
        const promise = sale.updateUserSale('1', 1, 1);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update customer sale that does not exists', async () => {
        db.setIndexToUse(2);
        expect.assertions(1);
        const promise = sale.updateUserSale('1', 1, 1);
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update customer sale on closed database', async () => {
        db.setDBState(false);
        expect.assertions(1);
        const promise = sale.updateUserSale('1', 1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Update customer sale and regular sale', async () => {
        expect.assertions(1);
        const promise = sale.updateSalesAndUsers('1', 1, '1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update customer sale and regular sale that already exists', async () => {
        db.setIndexToUse(1);
        expect.assertions(1);
        const promise = sale.updateSalesAndUsers('1', 1, '1');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update customer sale and regular sale that does not exists', async () => {
        db.setIndexToUse(2);
        expect.assertions(1);
        const promise = sale.updateSalesAndUsers('1', 1, '1');
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update customer sale and regular sale on closed database', async () => {
        db.setDBState(false);
        expect.assertions(1);
        const promise = sale.updateSalesAndUsers('1', 1, '1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Delete sale', async () => {
        expect.assertions(1);
        const promise = sale.deleteSale('1');
        await expect(promise).resolves.toBeDefined();
    });
    test('Delete sale on closed database', async () => {
        db.setDBState(false);
        const promise = sale.deleteSale('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Delete customer sale', async () => {
        expect.assertions(1);
        const promise = sale.deleteUserSale('1');
        await expect(promise).resolves.toBeDefined();
    });
    test('Delete customer sale on closed database', async () => {
        db.setDBState(false);
        const promise = sale.deleteUserSale('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
