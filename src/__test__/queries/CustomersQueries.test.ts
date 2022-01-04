import { GeneralServerError } from "../../exceptions/GeneralServerError";
import { queryType } from "../../app";
import CustomerQueries from "../../queries/CustomerQueries";
import { exampleResult, MockDatabase, singleResult } from "../../model/MockDatabase";
import { convertStringToSQLDate } from "../../util/ConvertStringToSQLDate";
import { ItemAlreadyExistsError } from "../../exceptions/ItemAlreadyExistsError";

describe('CustomerQueriesTest', () => {

    let customer: CustomerQueries;
    let db: Database<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        customer = new CustomerQueries(db);
    });

    //
    // ------------------------- Create statements test -------------------------
    //
    test("Create a customer", () => {
        customer.createNewCustomer("testName", convertStringToSQLDate("2000-01-01"), "NL22INGB00000000")
        .then(val => expect(val).toBeGreaterThanOrEqual(1))
        .catch(err => expect(err).toBeNaN);
    });

    test("Create an existing customer", () => {
        customer.createNewCustomer("testName", convertStringToSQLDate("2000-01-01"), "NL22INGB00000000")
        .then(val => expect(val).toBeNaN)
        .catch(err => expect(err).toBeInstanceOf(ItemAlreadyExistsError));
    });


    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("Get all customers", () => {
        // tslint:disable-next-line: no-console
        customer.getAllCustomers().then(
            res => expect(res).toMatchObject(exampleResult[1].result)
        ).catch(err => expect(err).rejects.toBeNaN());
    });

    test("Get one customer", () => {
        customer.getCustomerByID("1").then(
            res => expect(res[0]).toMatchObject(exampleResult[1].result[0])
        ).catch(err => expect(err).rejects.toBeNaN());
    });

    test("Fail all customers", () => {
        db.setDBState(false);
        // tslint:disable-next-line: no-console
        customer.getAllCustomers().then(
            res => expect(res).rejects.toBeNaN()
        ).catch(err => {
            expect(err).toBeInstanceOf(GeneralServerError);
        });
    });

    test("Fail one customer", () => {
        db.setDBState(false);
        customer.getCustomerByID("1")
            .then(res => expect(res).rejects.toBeNaN())
            .catch(err => expect(err).toBeInstanceOf(GeneralServerError));
    });
});