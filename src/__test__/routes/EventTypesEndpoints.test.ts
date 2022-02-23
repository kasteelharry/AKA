import * as app from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import supertest, { SuperTest, Test } from 'supertest';
import UserAuthentication from '@dir/util/UserAuthentication';
jest.mock('@dir/model/MySQLDatabase');
describe('Test Eventtypes Routing', () => {
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
        database = new MockDatabase();
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
        const promise = await request.post('/api/eventtypes/')
            .send({
                name: 'Event names'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST / General Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/eventtypes/')
            .send({
                name: 'Event names'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST / Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/eventtypes/')
            .send({
                name: 'Event names'
            });
        expect(promise.statusCode).toBe(403);
    });

    test('POST /prices', async () => {
        database.setDBState(true);
        database.setFailInsert(false);
        database.setDuplicateInsert(false);
        database.setIndexToUse(0);
        const promise = await request.post('/api/eventtypes/prices/')
            .send({
                eventtypesID: 1,
                productID: 2,
                price: 100
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /prices', async () => {
        database.setDBState(true);
        database.setFailInsert(false);
        database.setDuplicateInsert(false);
        database.setIndexToUse(0);
        const promise = await request.post('/api/eventtypes/prices/')
            .send({
                eventtypesID: 1,
                productID: 2,
                price: 'Not a price'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /prices General Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/eventtypes/prices/')
            .send({
                eventtypesID: 1,
                productID: 2,
                price: 100
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /prices Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/eventtypes/prices/')
            .send({
                eventtypesID: 1,
                productID: 2,
                price: 100
            });
        expect(promise.statusCode).toBe(403);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('GET /', async () => {
        const promise = await request.get('/api/eventtypes/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET / Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/eventtypes/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventTypeID', async () => {
        const promise = await request.get('/api/eventtypes/1');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventTypeID Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/eventtypes/1');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventTypeID/prices', async () => {
        const promise = await request.get('/api/eventtypes/1/prices');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventTypeID/prices Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/eventtypes/1/prices');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventTypeID/:productID/prices', async () => {
        const promise = await request.get('/api/eventtypes/1/1/prices');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventTypeID/:productID/prices Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/eventtypes/1/1/prices');
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('POST /:eventTypeID', async () => {
        const promise = await request.post('/api/eventtypes/1/')
            .send({
                name: 'event'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventID Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/eventtypes/1/')
            .send({
                name: 'event'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventTypeID/prices/update', async () => {
        const promise = await request.post('/api/eventtypes/Joris/prices/update/')
            .send({
                productID: 1,
                price: '100'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventTypeID/prices/update Bad price', async () => {
        const promise2 = await request.post('/api/eventtypes/Joris/prices/update/')
            .send({
                productID: 1,
                price: 'Bad price'
            });
        expect(promise2.statusCode).toBe(500);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('POST /:eventTypeID/delete', async () => {
        const promise = await request.post('/api/eventtypes/Joris/delete/')
            .send();
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventTypeID/delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/eventtypes/1/delete/')
            .send({
                eventtypesID: 1
            });
        expect(promise.statusCode).toBe(204);
    });

    test('POST /:eventTypeID/delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/eventtypes/1/delete/')
            .send({
                eventtypesID: 1
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventTypeID/prices/delete', async () => {
        database.setIndexToUse(0);
        const promise = await request.post('/api/eventtypes/Joris/prices/delete/')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventTypeID/delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/eventtypes/1/prices/delete/')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(204);
    });

    test('POST /:eventTypeID/prices/delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/eventtypes/1/prices/delete/')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(500);
    });
});
