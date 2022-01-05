import UserAuthentication from "../../util/UserAuthentication";
import { queryType } from "../../app";
import { MockDatabase } from "../../model/MockDatabase";
import { GeneralServerError } from "../../exceptions/GeneralServerError";
describe('UserAuthenticationTests', () => {
    let auth: UserAuthentication;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        auth = new UserAuthentication(db);
    });

    beforeEach(() => {
        db.setDBState(true);
        db.setIndexToUse(0);
    });


    test("Authenticate a valid \"session\".", async () => {
        // Yes I am aware that this session is not a real session.
        // I am only testing the methods internal logic, not the database.
        const promise = auth.authenticateUser("1");
        await expect(promise).resolves.toBeTruthy();
    });

    test("Authenticate an invalid \"session\".", async () => {
        db.setIndexToUse(1);
        const promise = auth.authenticateUser("session");
        await expect(promise).resolves.toBeFalsy();
    });

    test("Authenticate an expired \"session\".", async () => {
        db.setIndexToUse(2);
        const promise = auth.authenticateUser("2");
        await expect(promise).resolves.toBeFalsy();
    });

    test("Authenticate a \"session\" on a closed database.", async () => {
        db.setDBState(false);
        const promise = auth.authenticateUser("1");
        await expect(promise).resolves.toBeFalsy();
    });

    test("Registering a valid \"session\".", async () => {
        const promise = auth.registerSession("1", 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeTruthy();
    });

    test("Registering a \"session\" on a closed database.", async () => {
        db.setDBState(false);
        const promise = auth.registerSession("1", 'joriskuiper2@gmail.com');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Registering an invalid \"session\".", async () => {
        db.setIndexToUse(1);
        const promise = auth.registerSession("2", 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeFalsy();
    });

    test("Registering a valid Google \"session\".", async () => {
        const promise = auth.registerGoogleSession("1", 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeTruthy();
    });

    test("Registering an invalid Google \"session\".", async () => {
        db.setIndexToUse(1);
        const promise = auth.registerGoogleSession("2", 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeTruthy();
    });

    test("Registering a valid Google \"session\" on a closed database.", async () => {
        db.setDBState(false);
        const promise = auth.registerGoogleSession("1", 'joriskuiper2@gmail.com');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    //
    // ------------------------- Update statements test -------------------------
    //

    //
    // ------------------------- Delete statements test -------------------------
    //

});