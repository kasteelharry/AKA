import UserAuthentication from '@dir/util/UserAuthentication';
import { queryType } from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
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
        db.setFailInsert(false);
        db.setDuplicateInsert(false);
    });

    test('Authenticate a valid "session".', async () => {
        // Yes I am aware that this session is not a real session.
        // I am only testing the methods internal logic, not the database.
        const promise = auth.authenticateUser('1');
        await expect(promise).resolves.toBeTruthy();
    });

    test('Authenticate an invalid "session".', async () => {
        db.setIndexToUse(1);
        const promise = auth.authenticateUser('session');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Authenticate an expired "session".', async () => {
        db.setIndexToUse(2);
        const promise = auth.authenticateUser('2');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Authenticate an expired non-existent "session".', async () => {
        db.setIndexToUse(3);
        const promise = auth.authenticateUser('existentSession');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Authenticate a "session" on a closed database.', async () => {
        db.setDBState(false);
        const promise = auth.authenticateUser('1');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Registering a valid "session".', async () => {
        const promise = auth.registerSession('1', 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeTruthy();
    });

    test('Failing to register a valid "session".', async () => {
        db.setFailInsert(true);
        const promise = auth.registerSession('1', 'joriskuiper2@gmail.com');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Failing to register a duplicate "session".', async () => {
        db.setDuplicateInsert(true);
        const promise = auth.registerSession('1', 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Registering a valid "session" with non-existent user', async () => {
        const promise = auth.registerSession('1', 'amy@gmail.com');
        await expect(promise).resolves.toBeFalsy();
    });

    test('Registering a "session" on a closed database.', async () => {
        db.setDBState(false);
        const promise = auth.registerSession('1', 'joriskuiper2@gmail.com');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
    test('Registering a valid Google "session".', async () => {
        const promise = auth.registerGoogleSession('1', 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeTruthy();
    });

    test('Registering an invalid Google "session".', async () => {
        const promise = auth.registerGoogleSession('2', 'joriskuiper2@gmail.com');
        await expect(promise).resolves.toBeTruthy();
    });

    test('Registering a valid Google "session" on a closed database.', async () => {
        db.setDBState(false);
        const promise = auth.registerGoogleSession('1', 'joriskuiper2@gmail.com');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Failing to register a valid Google "session" with non-existent user', async () => {
        db.setFailInsert(true);
        const promise = auth.registerGoogleSession('1', 'bobby@gmail.com');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Failing to register a duplicate Google "session" with non-existent user', async () => {
        db.setDuplicateInsert(true);
        const promise = auth.registerGoogleSession('1', 'bobby@gmail.com');
        await expect(promise).resolves.toBeFalsy();
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
