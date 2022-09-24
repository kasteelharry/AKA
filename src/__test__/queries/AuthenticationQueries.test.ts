import { MockDatabase } from '@dir/model/MockDatabase';
import { queryType } from '@dir/app';
import AuthenticationQueries from '@dir/queries/AuthenticationQueries';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';

describe('AuthenticationQueriesTest', () => {
    let auth: AuthenticationQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        auth = new AuthenticationQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
        db.setFailInsert(false);
        db.setDuplicateInsert(false);
    });

    //
    // ------------------------- Create statements test -------------------------
    //

    test('Authenticate existent user in Database', async () => {
        const promise = auth.authenticateUserInDB(1, 'session');
        await expect(promise).resolves.toBeDefined();
    });

    test('Authenticate non-existent user in Database', async () => {
        db.setFailInsert(true);
        const promise = auth.authenticateUserInDB(1, 'session');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Authenticate duplicate user in Database', async () => {
        db.setDuplicateInsert(true);
        const promise = auth.authenticateUserInDB(1, 'session');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Authenticate existent Google user in Database', async () => {
        const promise = auth.authenticateGUserInDB('1', 'session');
        await expect(promise).resolves.toBeDefined();
    });

    test('Authenticate non-existent Google user in Database', async () => {
        db.setFailInsert(true);
        const promise = auth.authenticateGUserInDB('1', 'session');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Authenticate duplicate user Google in Database', async () => {
        db.setDuplicateInsert(true);
        const promise = auth.authenticateGUserInDB('1', 'session');
        await expect(promise).resolves.toBeFalsy();
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Verify session in the database', async () => {
        const promise = auth.verifyUserInDB('existentSession');
        await expect(promise).resolves.toBeDefined();
    });

    test('Verify session in closed database', async () => {
        db.setDBState(false);
        const promise = auth.verifyUserInDB('existentSession');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Logging out user', async () => {
        const promise = auth.logOutUser('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Logging out user in closed database', async () => {
        db.setDBState(false);
        const promise = auth.logOutUser('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Logging out session', async () => {
        const promise = auth.logOutSession('existentSession');
        await expect(promise).resolves.toBeDefined();
    });

    test('Logging out session in closed database', async () => {
        db.setDBState(false);
        const promise = auth.logOutSession('existentSession');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
