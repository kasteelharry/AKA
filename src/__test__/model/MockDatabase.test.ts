import { MockDatabase } from '@dir/model/MockDatabase';
import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { convertStringToSQLDate } from '@dir/util/ConvertStringToSQLDate';

describe('Test MockDatabase', () => {
    let db: MockDatabase<queryType>;

    beforeEach(() => {
        db = new MockDatabase();
    });

    test('Test get fail insert', async () => {
        expect(db.getFailInsert()).toBeFalsy();
    });

    test('Test set fail insert', async () => {
        db.setFailInsert(true);
        expect(db.getFailInsert()).toBeTruthy();
    });

    test('Test get duplicate insert', async () => {
        expect(db.getDuplicateInsert()).toBeFalsy();
    });

    test('Test set duplicate insert', async () => {
        db.setDuplicateInsert(true);
        expect(db.getDuplicateInsert()).toBeTruthy();
    });

    test('Test get database state', async () => {
        expect(db.getDBState()).toBeTruthy();
    });

    test('Test set database state', async () => {
        db.setDBState(false);
        expect(db.getDBState()).toBeFalsy();
    });

    test('Test get index to use', async () => {
        expect(db.getIndexToUse()).toEqual(0);
    });

    test('Test set database state', async () => {
        db.setIndexToUse(1);
        expect(db.getIndexToUse()).toEqual(1);
    });

    test('Test delete elements function', async () => {
        expect.assertions(3);
        expect(db.deleteElements()).toBeDefined();
        db.setIndexToUse(2);
        expect(db.deleteElements()).toBeDefined();
        db.setIndexToUse(3);
        try {
            db.deleteElements();
        } catch (error) {
            expect(error).toBeInstanceOf(EmptySQLResultError);
        }
    });

    test('Test update elements function', async () => {
        expect(db.updateElements(1, [1])).toBeDefined();
        db.setIndexToUse(1);
        expect(db.updateElements(1, [1])).toBeDefined();
        db.setIndexToUse(2);
        expect(db.updateElements(1, [1])).toBeDefined();
    });

    test('Test create elements function', async () => {
        expect.assertions(4);
        expect(db.createElements([])).toBeDefined();
        expect(db.createElements(['Hello'])).toBeDefined();
        try {
            db.setDuplicateInsert(true);
            db.createElements(['Hello']);
        } catch (error) {
            expect(error).toBeInstanceOf(GeneralServerError);
        }
        try {
            db.setDuplicateInsert(false);
            db.setFailInsert(true);
            db.createElements(['Hello']);
        } catch (error) {
            expect(error).toBeInstanceOf(GeneralServerError);
        }
    });

    test('Get all elements', async () => {
        expect(db.getAllElements()).toBeDefined();
    });

    test('Get single element', async () => {
        expect.assertions(8);
        const ts = convertStringToSQLDate('2000-12-12');
        if (ts === undefined) {
            return;
        }
        expect(db.getElements(1)).toBeDefined();
        expect(db.getElements(-1)).toBeDefined();
        expect(db.getElements('Joris')).toBeDefined();
        expect(db.getElements('joriskuiper2@gmail.com')).toBeDefined();
        expect(db.getElements('NL22INGB0123456789')).toBeDefined();
        expect(db.getElements('existentSession')).toBeDefined();
        expect(db.getElements(ts)).toBeDefined();
        try {
            db.getElements(100);
        } catch (error) {
            expect(error).toBeInstanceOf(EmptySQLResultError);
        }
    });

    test('Test mock execute transactions', async () => {
        const ts = convertStringToSQLDate('2000-12-12');
        if (ts === undefined) {
            return;
        }
        await expect(db.executeTransactions([''])).rejects.toBeInstanceOf(TypeError);
        db.setDBState(false);
        await expect(db.executeTransactions([''])).rejects.toBeInstanceOf(GeneralServerError);
        db.setDBState(true);
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'SELECT *',
                parameters: []
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'SELECT *',
                parameters: ['name']
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'SELECT *',
                parameters: ['1']
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'SELECT *',
                parameters: [ts]
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'SELECT *',
                parameters: [1]
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'INSERT *',
                parameters: ['1']
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'UPDATE *',
                parameters: ['1', '1']
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'DELETE *',
                parameters: ['1', '1']
            }
        ])).resolves.toBeDefined();
        await expect(db.executeTransactions([
            {
                id: 1,
                query: 'NON-EXISTENT *',
                parameters: []
            }
        ])).rejects.toBeInstanceOf(GeneralServerError);
    });
});
