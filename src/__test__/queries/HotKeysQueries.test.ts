import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { MockDatabase } from '@dir/model/MockDatabase';
import HotKeyQueries from '@dir/queries/HotKeysQueries';

describe('Test hotkey queries', () => {
    let hotkey: HotKeyQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        hotkey = new HotKeyQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
        db.setFailInsert(false);
        db.setDuplicateInsert(false);
        db.setIndexToUse(0);
    });

    //
    // ------------------------- Create statements test -------------------------
    //
    test('Create new hotkey.', async () => {
        const promise = hotkey.createNewHotKey('product', 'F1');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create new hotkey with product id.', async () => {
        const promise = hotkey.createNewHotKey('1', 'F1');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate hotkey.', async () => {
        db.setDuplicateInsert(true);
        const promise = hotkey.createNewHotKey('1', 'F1');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Failure create duplicate product.', async () => {
        db.setFailInsert(true);
        const promise = hotkey.createNewHotKey('1', 'F1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Retrieve all hotkeys.', async () => {
        const promise = hotkey.getAllHotkeys();
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all hotkeys on closed database.', async () => {
        db.setDBState(false);
        const promise = hotkey.getAllHotkeys();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve single hotkey.', async () => {
        const promise = hotkey.getHotkeyByProduct('product');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single hotkey.', async () => {
        const promise = hotkey.getHotkeyByProduct('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single hotkey on closed database.', async () => {
        db.setDBState(false);
        const promise = hotkey.getHotkeyByProduct('product');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('Update hotkey', async () => {
        const promise = hotkey.updateHotkey('product', 'F1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update hotkey by id', async () => {
        const promise = hotkey.updateHotkey('1', 'F1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update hotkey that already exists', async () => {
        db.setIndexToUse(1);
        const promise = hotkey.updateHotkey('product', 'F1');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update hotkey that does not exists', async () => {
        db.setIndexToUse(2);
        const promise = hotkey.updateHotkey('product', 'F1');
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update hotkey on closed database', async () => {
        db.setDBState(false);
        const promise = hotkey.updateHotkey('product', 'F1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Delete hotkey', async () => {
        const promise = hotkey.deleteHotkey('product');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete hotkey by ID', async () => {
        const promise = hotkey.deleteHotkey('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete hotkey on closed database', async () => {
        db.setDBState(false);
        const promise = hotkey.deleteHotkey('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
