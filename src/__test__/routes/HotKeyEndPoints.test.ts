import * as app from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import supertest, { SuperTest, Test } from 'supertest';
import UserAuthentication from '@dir/util/UserAuthentication';
jest.mock('@dir/model/MySQLDatabase');
describe('Test hotkeys Routing', () => {
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

    test('POST /', async () => {
        const promise = await request.post('/api/hotkeys/')
            .send({
                productID: 1,
                hotkey: 'F3'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST / GeneralError', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/hotkeys/')
            .send({
                productID: 1,
                hotkey: 'F3'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST / Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/hotkeys/')
            .send({
                productID: 1,
                hotkey: 'F3'
            });
        expect(promise.statusCode).toBe(403);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('GET /', async () => {
        const promise = await request.get('/api/hotkeys/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET / Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/hotkeys/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventID', async () => {
        const promise = await request.get('/api/hotkeys/1');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventID Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/hotkeys/1');
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('POST /update', async () => {
        const promise = await request.post('/api/hotkeys/update')
            .send({
                productID: 1,
                hotkey: 'F3'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /update Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/hotkeys/update')
            .send({
                productID: 1,
                hotkey: 'F3'
            });
        expect(promise.statusCode).toBe(500);
    });
    //
    // ------------------------- Delete statements test -------------------------
    //

    test('DELETE /delete', async () => {
        const promise = await request.post('/api/hotkeys/delete')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(200);
    });

    test('DELETE /delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/hotkeys/delete')
            .send({
                eventID: 1
            });
        expect(promise.statusCode).toBe(204);
    });

    test('DELETE /delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/hotkeys/delete')
            .send({
                eventID: 1
            });
        expect(promise.statusCode).toBe(500);
    });
});
