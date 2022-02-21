import * as app from '@dir/app';
import { MockDatabase } from '@dir/model/MockDatabase';
import supertest, { SuperTest, Test } from 'supertest';
import UserAuthentication from '@dir/util/UserAuthentication';
jest.mock('@dir/model/MySQLDatabase');
describe('Test Customer Routing', () => {
    // eslint-disable-next-line no-unused-vars
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
        const promise = await request.post('/api/customers/')
            .send({
                name: 'joris',
                bank: 'NL22INGB000001111122',
                birthdate: '26-01-2001'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST / GeneralError', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/customers/')
            .send({
                name: 'joris',
                bank: 'NL22INGB000001111122',
                birthdate: '26-01-2001'
            });
        expect(promise.statusCode).toBe(500);
    });

    test('POST / Duplicate Error', async () => {
        database.setDuplicateInsert(true);
        const promise = await request.post('/api/customers/')
            .send({
                name: 'joris',
                bank: 'NL22INGB000001111122',
                birthdate: '26-01-2001'
            });
        expect(promise.statusCode).toBe(403);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('GET /', async () => {
        const promise = await request.get('/api/customers/');
        expect(promise.statusCode).toBe(200);
    });

    test('GET / Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/customers/');
        expect(promise.statusCode).toBe(500);
    });

    test('GET /:customerID', async () => {
        const promise = await request.get('/api/customers/joris');
        expect(promise.statusCode).toBe(200);
    });

    test('GET /:customerID Error', async () => {
        expect.assertions(1);
        database.setDBState(false);
        const promise = await request.get('/api/customers/joris');
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('POST /:customerID', async () => {
        const promise = await request.post('/api/customers/1')
            .send({
                name: 'joris',
                bank: 'NL22INGB000001111122',
                birthdate: '26-01-2001',
                active: 'true'
            });
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:customerID Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/customers/1')
            .send({
                name: 'joris',
                bank: 'NL22INGB000001111122',
                birthdate: '26-01-2001',
                active: 'true'
            });
        expect(promise.statusCode).toBe(500);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('POST /:customerID/delete', async () => {
        const promise = await request.post('/api/customers/1/delete')
            .send();
        expect(promise.statusCode).toBe(200);
    });

    test('POST /:customerID/delete Error Not Found', async () => {
        database.setIndexToUse(2);
        const promise = await request.post('/api/customers/1/delete')
            .send();
        expect(promise.statusCode).toBe(204);
    });

    test('POST /:customerID/delete Error', async () => {
        database.setDBState(false);
        const promise = await request.post('/api/customers/1/delete')
            .send();
        expect(promise.statusCode).toBe(500);
    });
});
