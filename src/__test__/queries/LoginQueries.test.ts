import { queryType } from "@dir/app";
import { MockDatabase } from "@dir/model/MockDatabase";
import LoginQueries from "@dir/queries/LoginQueries";
import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";

describe("LoginQueriesTest", () => {


    let login: LoginQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        login = new LoginQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
    });

    //
    // ------------------------- Create statements test -------------------------
    //

    test("Register new user", async () => {
        const promise = login.registerLogin("test@email.com", "testHash", "testSalt");
        await expect(promise).resolves.toBeDefined();
    });

    test("Register new user on a closed database", async () => {
        db.setDBState(false);
        const promise = login.registerLogin("test@email.com", "testHash", "testSalt");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("Retrieve user id for login", async () => {
        const promise = login.retrieveUserID("joriskuiper2@gmail.com");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve non-existent user id for login", async () => {
        const promise = login.retrieveUserID("bobby@gmail.com");
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test("Retrieve user id for login on a closed database", async () => {
        db.setDBState(false);
        const promise = login.retrieveUserID("test@gmail.com");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Retrieve new salt for login", async () => {
        const promise = login.retrieveSalt("bobby@gmail.com");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve existing salt for login", async () => {
        const promise = login.retrieveSalt("charlie@gmail.com");
        await expect(promise).resolves.toEqual("testSalt");
    });

    test("Retrieve existing salt for login on a closed database", async () => {
        db.setDBState(false);
        const promise = login.retrieveSalt("charlie@gmail.com");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve existing salt for login on a closed database creates a new salt", async () => {
        db.setDBState(false);
        const promise = login.retrieveSalt("charlie@gmail.com");
        await expect(promise).resolves.not.toEqual("testSalt");
    });

    test("Retrieve hash from database",async () => {
        const promise = login.retrieveHash("charlie@gmail.com");
        await expect(promise).resolves.toEqual("testHash");
    });

    test("Retrieve hash from closed database",async () => {
        db.setDBState(false);
        const promise = login.retrieveHash("charlie@gmail.com");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Retrieve non-existent hash from database",async () => {
        const promise = login.retrieveHash("joriskuiper2@gmail.com");
        await expect(promise).resolves.toBeUndefined();
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    //
    // ------------------------- Delete statements test -------------------------
    //
});