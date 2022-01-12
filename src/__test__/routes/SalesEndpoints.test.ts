import * as app from "@dir/app";
import { MockDatabase } from "@dir/model/MockDatabase";
import supertest, { SuperTest, Test } from "supertest";
import UserAuthentication from "@dir/util/UserAuthentication";
jest.mock("@dir/model/MySQLDatabase");
describe("Test sales Routing", () => {

    let mock: jest.SpyInstance;
    let request: SuperTest<Test>;
    let database:MockDatabase<app.queryType>;

    beforeAll(() => {
        database = new MockDatabase();
        mock = jest.spyOn(app, 'default').mockImplementation(() => {
            return database;
        });
        jest.spyOn(UserAuthentication.prototype, 'authenticateUser').mockResolvedValue(true);
        request = supertest(app.appExport);
    });

    beforeEach(() => {
        database.setDBState(true);
        database.setFailInsert(false);
        database.setDuplicateInsert(false);
        database.setIndexToUse(0);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    //
    // ------------------------- Create statements test -------------------------
    //

    test("POST /", async () => {
        const promise = await request.post("/api/sales/")
        .send({
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(200);
    });

    test("POST / GeneralError", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/")
        .send({
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(500);
    });

    test("POST / Duplicate Error", async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post("/api/sales/")
        .send({
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(403);
    });

    test("POST /customers", async () => {
        const promise = await request.post("/api/sales/customers/")
        .send({
            customerID: 1,
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(200);
    });

    test("POST /customers GeneralError", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/customers/")
        .send({
            customerID: 1,
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(500);
    });

    test("POST / Duplicate Error", async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post("/api/sales/customers/")
        .send({
            customerID: 1,
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(403);
    });


    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("GET /", async () => {
        const promise = await request.get("/api/sales/");
        expect(promise.statusCode).toBe(200);
    });

    test("GET / Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /events/:eventID", async () => {
        const promise = await request.get("/api/sales/events/1");
        expect(promise.statusCode).toBe(200);
    });

    test("GET /events/:eventID Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/events/1");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /customers/:customerID", async () => {
        const promise = await request.get("/api/sales/customers/1");
        expect(promise.statusCode).toBe(200);
    });

    test("GET /customers/:customerID Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/customers/1");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /customers/:customerID/:eventID", async () => {
        const promise = await request.get("/api/sales/customers/1/1");
        expect(promise.statusCode).toBe(200);
    });

    test("GET /customers/:customerID/:eventID Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/customers/1/1");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /timestamp/:timestamp", async () => {
        const promise = await request.get("/api/sales/timestamp/2000-12-12");
        expect(promise.statusCode).toBe(200);
    });

    test("GET /timestamp/:timestamp Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/timestamp/2000-12-12");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /timestamp/:timestamp Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/timestamp/bad");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /timestamp/:timestamp/:timestamp2", async () => {
        const promise = await request.get("/api/sales/timestamp/2000-12-12/2001-12-12");
        expect(promise.statusCode).toBe(200);
    });

    test("GET /timestamp/:timestamp/:timestamp2 bad timestamps", async () => {
        const promise = await request.get("/api/sales/timestamp/2000-12-12/nope");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /timestamp/:timestamp/:timestamp2 bad timestamps", async () => {
        const promise = await request.get("/api/sales/timestamp/nope/2000-12-12");
        expect(promise.statusCode).toBe(500);
    });

    test("GET /timestamp/:timestamp/:timestamp2 Error", async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get("/api/sales/timestamp/2000-12-12/2001-12-12");
        expect(promise.statusCode).toBe(500);
    });


    //
    // ------------------------- Update statements test -------------------------
    //

    test("POST /update", async () => {
        const promise = await request.post("/api/sales/update")
        .send({
            customerID: 1,
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(200);
    });

    test("POST /update bad timestamp", async () => {
        const promise = await request.post("/api/sales/update")
        .send({
            customerID: 1,
            eventID: 1,
            productID: 1,
            amount: 1,
        });
        expect(promise.statusCode).toBe(500);
    });

    test("POST /update Error", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/update")
        .send({
            customerID: 1,
            eventID: 1,
            productID: 1,
            amount: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(500);
    });

    test("POST /customers/update", async () => {
        const promise = await request.post("/api/sales/customers/update")
        .send({
            customerID: 1,
            totalPrice: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(200);
    });

    test("POST /customers/update bad timestamp", async () => {
        const promise = await request.post("/api/sales/customers/update")
        .send({
            customerID: 1,
            totalPrice: 1,
            amount: 1,
        });
        expect(promise.statusCode).toBe(500);
    });

    test("POST /customers/update Error", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/customers/update")
        .send({
            customerID: 1,
            totalPrice: 1,
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(500);
    });
    //
    // ------------------------- Delete statements test -------------------------
    //

    test("DELETE /delete", async () => {
        const promise = await request.post("/api/sales/delete")
        .send({
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(200);
    });

    test("DELETE /delete Error Not Found", async () => {
        database.setIndexToUse(2);
        const promise = await request.post("/api/sales/delete")
        .send({
            timestamp: "2011-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(204);
    });

    test("DELETE /delete Error", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/delete")
        .send({
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(500);
    });

    test("DELETE /delete Error bad timestamp", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/delete")
        .send({
            timestamp: "Bad timestamp",
        });
        expect(promise.statusCode).toBe(500);
    });

    test("DELETE /customers/delete", async () => {
        const promise = await request.post("/api/sales/customers/delete")
        .send({
            timestamp: "2000-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(200);
    });

    test("DELETE /customers/delete Error Not Found", async () => {
        database.setIndexToUse(2);
        const promise = await request.post("/api/sales/customers/delete")
        .send({
            timestamp: "2010-12-12 12:12:12",
        });
        expect(promise.statusCode).toBe(204);
    });

    test("DELETE /customers/delete Error", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/customers/delete")
        .send({
            timestamp: "2010-12-12 12:12:12:12",
        });
        expect(promise.statusCode).toBe(500);
    });

    test("DELETE /customers/delete Error bad timestamps", async () => {
        database.setDBState(false);
        const promise = await request.post("/api/sales/customers/delete")
        .send({
            timestamp: "NOT a timestamp",
        });
        expect(promise.statusCode).toBe(500);
    });
});