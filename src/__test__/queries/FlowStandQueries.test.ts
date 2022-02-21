import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { MockDatabase } from '@dir/model/MockDatabase';
import FlowStandQueries from '@dir/queries/FlowStandQueries';

describe('Test flowstand queries', () => {
    let flow: FlowStandQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        flow = new FlowStandQueries(db);
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
    test('Create new flowstand.', async () => {
        const promise = flow.createNewFlowStand(1, 1, 1);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create duplicate flowstand.', async () => {
        db.setDuplicateInsert(true);
        const promise = flow.createNewFlowStand(1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Fail create duplicate flowstand.', async () => {
        db.setFailInsert(true);
        const promise = flow.createNewFlowStand(1, 1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Retrieve all flowstand.', async () => {
        const promise = flow.getAllFlowStand();
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all flowstand on closed db.', async () => {
        db.setDBState(false);
        const promise = flow.getAllFlowStand();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve flowstand by event.', async () => {
        const promise = flow.getFlowStandByEvent('joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve flowstand by event with id.', async () => {
        const promise = flow.getFlowStandByEvent('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve flowstand by event on closed db.', async () => {
        db.setDBState(false);
        const promise = flow.getFlowStandByEvent('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('Update flowstand', async () => {
        const promise = flow.updateFlowStand('product', 1, 1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update flowstand by id', async () => {
        const promise = flow.updateFlowStand('1', 1, 1);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update flowstand that already exists', async () => {
        db.setIndexToUse(1);
        const promise = flow.updateFlowStand('product', 1, 1);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update flowstand that does not exists', async () => {
        db.setIndexToUse(2);
        const promise = flow.updateFlowStand('product', 1, 1);
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update flowstand on closed database', async () => {
        db.setDBState(false);
        const promise = flow.updateFlowStand('product', 1, 1);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Delete flowstand', async () => {
        const promise = flow.deleteFlowstand('product');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete flowstand by ID', async () => {
        const promise = flow.deleteFlowstand('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete flowstand on closed database', async () => {
        db.setDBState(false);
        const promise = flow.deleteFlowstand('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
