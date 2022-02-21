import * as app from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import supertest, { SuperTest, Test } from 'supertest';
import UserAuthentication from '@dir/util/UserAuthentication';
jest.mock('@dir/model/MySQLDatabase');
describe('Test Products Routing', () => {
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
        const promise = await request.post('/api/products/')
            .send({
                name: 'Product'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST / GeneralError', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/products/')
            .send({
                name: 'Product'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST / Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/products/')
            .send({
                name: 'Product'
            });
        expect(promise.statusCode).toBe(403);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('GET /', async () => {
        const promise = await request.get('/api/products/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET / Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/products/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:productID', async () => {
        const promise = await request.get('/api/products/1');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:productID Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/products/1');
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('POST /:productID', async () => {
        const promise = await request.post('/api/products/1')
            .send({
                name: 'joris',
                archive: 'true'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:productID Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/products/1')
            .send({
                name: 'joris',
                archive: 'true'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST /:productID/archive', async () => {
        const promise = await request.post('/api/products/1/archive')
            .send({
                name: 'joris',
                archive: 'true'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:productID/archive Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/products/1/archive')
            .send({
                name: 'joris',
                archive: 'true'
            });
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('DELETE /:productID/delete', async () => {
        const promise = await request.post('/api/products/1/delete')
            .send();
        expect(promise.statusCode).toBe(200);
    });

    test('DELETE /:productID/delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/products/1/delete')
            .send();
        expect(promise.statusCode).toBe(204);
    });

    test('DELETE /:productID/delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/products/1/delete')
            .send();
        expect(promise.statusCode).toBe(500);
    });
});
