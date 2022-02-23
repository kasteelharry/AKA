import * as app from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import supertest, { SuperTest, Test } from 'supertest';
import UserAuthentication from '@dir/util/UserAuthentication';
jest.mock('@dir/model/MySQLDatabase');
describe('Test Events Routing', () => {
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
        const promise = await request.post('/api/events/')
            .send({
                name: 'Event names',
                type: 1,
                startTime: '12-12-2022 12:00:00',
                endTime: '12-13-2022 04:00:00',
                saved: 'false'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST / General Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/')
            .send({
                name: 'Event names',
                type: 1,
                startTime: '12-12-2022 12:00:00',
                endTime: '12-13-2022 04:00:00',
                saved: 'false'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST / Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/events/')
            .send({
                name: 'Event names',
                type: 1,
                startTime: '12-12-2022 12:00:00',
                endTime: '12-13-2022 04:00:00',
                saved: 'false'
            });
        expect(promise.statusCode).toBe(403);
    });

    test('POST /:eventsID/prices', async () => {
        database.setDBState(true);
        database.setFailInsert(false);
        database.setDuplicateInsert(false);
        database.setIndexToUse(0);
        const promise = await request.post('/api/events/joris/prices/')
            .send({
                eventsID: 1,
                productID: 2,
                price: 100
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventsID/prices', async () => {
        database.setDBState(true);
        database.setFailInsert(false);
        database.setDuplicateInsert(false);
        database.setIndexToUse(0);
        const promise = await request.post('/api/events/joris/prices/')
            .send({
                eventsID: 1,
                productID: 2,
                price: 'Not a price'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventsID/prices General Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/joris/prices/')
            .send({
                eventsID: 1,
                productID: 2,
                price: 100
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventsID/prices Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/events/joris/prices/')
            .send({
                eventsID: 1,
                productID: 2,
                price: 100
            });
        expect(promise.statusCode).toBe(403);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('GET /', async () => {
        const promise = await request.get('/api/events/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET / Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/events/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /active', async () => {
        const promise = await request.get('/api/events/active/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /active Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/events/active/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventID', async () => {
        const promise = await request.get('/api/events/1');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventID Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/events/1');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventID/prices', async () => {
        const promise = await request.get('/api/events/1/prices');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventID/prices Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/events/1/prices');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:eventID/:productID/prices', async () => {
        const promise = await request.get('/api/events/1/1/prices');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:eventID/:productID/prices Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/events/1/1/prices');
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('POST /:eventID', async () => {
        const promise = await request.post('/api/events/1/')
            .send({
                name: 'event',
                type: 1,
                startTime: '12-12-2022 12:00:00',
                endTime: '12-13-2022 04:00:00',
                saved: 'false'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventID Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/1/')
            .send({
                name: 'event',
                type: 1,
                startTime: '12-12-2022 12:00:00',
                endTime: '12-13-2022 04:00:00',
                saved: 'false'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventID/save', async () => {
        const promise = await request.post('/api/events/Joris/save/')
            .send({
                saved: 'true'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventID/save Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/update/save/')
            .send({
                saved: 'false'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventID/prices/update', async () => {
        const promise = await request.post('/api/events/Joris/prices/update/')
            .send({
                productID: 1,
                price: '100'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventID/prices/update Bad price', async () => {
        const promise2 = await request.post('/api/events/Joris/prices/update/')
            .send({
                productID: 1,
                price: 'Bad price'
            });
        expect(promise2.statusCode).toBe(500);
    });

    test('POST /:eventID/save Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/Joris/prices/update/')
            .send({
                productID: 1,
                saved: 'false'
            });
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('POST /:eventID/delete', async () => {
        const promise = await request.post('/api/events/Joris/delete/')
            .send();
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventID/delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/events/1/delete/')
            .send({
                eventsID: 1
            });
        expect(promise.statusCode).toBe(204);
    });

    test('POST /:eventID/delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/1/delete/')
            .send({
                eventsID: 1
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:eventID/prices/delete', async () => {
        database.setIndexToUse(0);
        const promise = await request.post('/api/events/Joris/prices/delete/')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:eventID/delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/events/1/prices/delete/')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(204);
    });

    test('POST /:eventID/prices/delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/events/1/prices/delete/')
            .send({
                productID: 1
            });
        expect(promise.statusCode).toBe(500);
    });
});
