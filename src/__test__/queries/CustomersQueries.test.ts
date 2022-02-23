import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { queryType } from '@dir/app';
import CustomerQueries from '@dir/queries/CustomerQueries';
import { MockDatabase } from '@dir/model/MockDatabase';
import { convertStringToSQLDate } from '@dir/util/ConvertStringToSQLDate';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';

describe('CustomerQueriesTest', () => {
    let customer: CustomerQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        customer = new CustomerQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
    });

    //
    // ------------------------- Create statements test -------------------------
    //
    test('Create a customer', async () => {
        const promise = customer.createNewCustomer('testName', convertStringToSQLDate('2000-01-01'), 'NL22INGB00000000');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create a customer on a closed database', async () => {
        db.setDBState(false);
        const promise = customer.createNewCustomer('testName', convertStringToSQLDate('2000-01-01'), 'NL22INGB00000000');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Get all customers', async () => {
        const promise = customer.getAllCustomers();
        await expect(promise).resolves.toBeDefined();
    });

    test('Get one customer', async () => {
        const promise = customer.getCustomerByID('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Get one customer by name', async () => {
        const promise = customer.getCustomerByID('Joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Fail all customers', async () => {
        db.setDBState(false);
        const promise = customer.getAllCustomers();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Fail one customer', async () => {
        db.setDBState(false);
        const promise = customer.getCustomerByID('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('Update existing customer', async () => {
        const params = new Map<string, string | number | undefined>();
        params.set('name', 'Anna');
        params.set('birthday', convertStringToSQLDate('1999-02-22'));
        params.set('bankaccount', 'NL11RABO1234567890');
        params.set('active', 1);
        const promise = customer.updateCustomer('1', params);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update existing customer by name', async () => {
        const params = new Map<string, string | number | undefined>();
        params.set('name', 'Anna');
        params.set('birthday', convertStringToSQLDate('1999-02-22'));
        params.set('bankaccount', 'NL11RABO1234567890');
        params.set('active', 1);
        const promise = customer.updateCustomer('Joris', params);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update existing customer by name with no parameters', async () => {
        const params = new Map<string, string | number | undefined>();
        const promise = customer.updateCustomer('Joris', params);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update existing customer on a closed database', async () => {
        db.setDBState(false);
        const params = new Map<string, string | number | undefined>();
        params.set('name', 'Anna');
        params.set('birthday', convertStringToSQLDate('1999-02-22'));
        params.set('bankaccount', 'NL11RABO1234567890');
        params.set('active', 'true');
        const promise = customer.updateCustomer('1', params);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Update existing customer with no data change', async () => {
        db.setIndexToUse(1);
        const params = new Map<string, string | number | undefined>();
        params.set('name', 'Anna');
        params.set('birthday', convertStringToSQLDate('1999-02-22'));
        params.set('bankaccount', 'NL11RABO1234567890');
        params.set('active', 1);
        const promise = customer.updateCustomer('1', params);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update non-existing customer', async () => {
        db.setIndexToUse(2);
        const params = new Map<string, string | number | undefined>();
        params.set('name', 'Anna');
        params.set('birthday', convertStringToSQLDate('1999-02-22'));
        params.set('bankaccount', 'NL11RABO1234567890');
        params.set('active', 1);
        const promise = customer.updateCustomer('1', params);
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Delete customer', async () => {
        const promise = customer.deleteCustomer('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete customer by name', async () => {
        const promise = customer.deleteCustomer('Joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete customer on closed database', async () => {
        db.setDBState(false);
        const promise = customer.deleteCustomer('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
