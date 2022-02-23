import * as app from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import supertest, { SuperTest, Test } from 'supertest';
import UserAuthentication from '@dir/util/UserAuthentication';
jest.mock('@dir/model/MySQLDatabase');
describe('Test Flowstand Routing', () => {
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
        const promise = await request.post('/api/flowstand/')
            .send({
                eventID: 1,
                start: 100,
                end: 110
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST / GeneralError', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/flowstand/')
            .send({
                eventID: 1,
                start: 100,
                end: 110
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST / Bad Flow count', async () => {
        const promise = await request.post('/api/flowstand/')
            .send({
                eventID: 1,
                start: 'Not an INT',
                end: 110
            });
        expect(promise.statusCode).toBe(500);
        const promise2 = await request.post('/api/flowstand/')
            .send({
                eventID: 'Not an Event',
                start: 1,
                end: 110
            });
        expect(promise2.statusCode).toBe(500);
    });

    test('POST / Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/flowstand/')
            .send({
                eventID: 1,
                start: 100,
                end: 110
            });
        expect(promise.statusCode).toBe(403);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('GET /', async () => {
        const promise = await request.get('/api/flowstand/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET / Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/flowstand/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventID', async () => {
        const promise = await request.get('/api/flowstand/1');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventID Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/flowstand/1');
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('POST /update', async () => {
        const promise = await request.post('/api/flowstand/update')
            .send({
                eventID: 1,
                start: 100,
                end: 110
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /update Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/flowstand/update')
            .send({
                eventID: 1,
                start: 100,
                end: 110
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /update Bad parameters', async () => {
        const promise = await request.post('/api/flowstand/update')
            .send({
                eventID: 'Not an Event',
                start: 1,
                end: 110
            });
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('DELETE /delete', async () => {
        const promise = await request.post('/api/flowstand/delete')
            .send({
                eventID: 1
            });
        expect(promise.statusCode).toBe(200);
    });

    test('DELETE /delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/flowstand/delete')
            .send({
                eventID: 1
            });
        expect(promise.statusCode).toBe(204);
    });

    test('DELETE /delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/flowstand/delete')
            .send({
                eventID: 1
            });
        expect(promise.statusCode).toBe(500);
    });
});
