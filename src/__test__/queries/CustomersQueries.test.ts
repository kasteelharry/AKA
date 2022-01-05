import { GeneralServerError } from "../../exceptions/GeneralServerError";
import { queryType } from "../../app";
import CustomerQueries from "../../queries/CustomerQueries";
import { exampleResult, MockDatabase } from "../../model/MockDatabase";
import { convertStringToSQLDate } from "../../util/ConvertStringToSQLDate";
import { ItemAlreadyExistsError } from "../../exceptions/ItemAlreadyExistsError";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";

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
    test("Create a customer", async () => {
        const promise = customer.createNewCustomer("testName", convertStringToSQLDate("2000-01-01"), "NL22INGB00000000");
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });


    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("Get all customers", async () => {
        const promise = customer.getAllCustomers();
        await expect(promise).resolves.toBeDefined();
    });

    test("Get one customer", async () => {
        const promise = customer.getCustomerByID("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Fail all customers", async () => {
        db.setDBState(false);
        const promise = customer.getAllCustomers();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Fail one customer", async () => {
        db.setDBState(false);
        const promise = customer.getCustomerByID("1");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test("Update existing customer", async () => {
        const params = new Map<string, string | number | undefined>();
        params.set("name", "Anna");
        params.set("birthday", convertStringToSQLDate("1999-02-22"));
        params.set("bankaccount", "NL11RABO1234567890");
        params.set("active", 1);
        const promise = customer.updateCustomer("1", params);
        await expect(promise).resolves.toBeDefined();
    });


    //
    // ------------------------- Delete statements test -------------------------
    //

    test("Delete customer", async () => {
        const promise = customer.deleteCustomer("1");
        await expect(promise).resolves.toBeDefined();
    });

});