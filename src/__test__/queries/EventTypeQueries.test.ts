import EventTypeQueries from '@dir/queries/EventTypeQueries';
import { MockDatabase } from '@dir/model/MockDatabase';
import { queryType } from '@dir/app';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
describe('EventTypeQueriesTest', () => {
    let event: EventTypeQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        event = new EventTypeQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
        db.setDuplicateInsert(false);
        db.setIndexToUse(0);
    });

    //
    // ------------------------- Create statements test -------------------------
    //

    test('Create an event type', async () => {
        const promise = event.createNewEventType('EventType');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create a duplicate event type', async () => {
        db.setDuplicateInsert(true);
        const promise = event.createNewEventType('EventType');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Create an event type on a closed database', async () => {
        db.setDBState(false);
        const promise = event.createNewEventType('EventType');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Create a new event type price', async () => {
        const promise = event.setEventTypePrices('EventName', 'ProductID', 100);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create a new event type price with product id', async () => {
        const promise = event.setEventTypePrices('EventName', '1', 100);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create a new event type price with event type id', async () => {
        const promise = event.setEventTypePrices('1', 'ProductID', 100);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test("Create a new event type price with id's", async () => {
        const promise = event.setEventTypePrices('1', '1', 100);
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test('Create a new event type price on closed database.', async () => {
        db.setDBState(false);
        const promise = event.setEventTypePrices('EventName', 'ProductID', 100);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Create a duplicate event type price', async () => {
        db.setDuplicateInsert(true);
        const promise = event.setEventTypePrices('EventName', 'ProductID', 100);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test('Retrieve all event types', async () => {
        const promise = event.getAllEventTypes();
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all event types on a closed database', async () => {
        db.setDBState(false);
        const promise = event.getAllEventTypes();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve a single event type', async () => {
        const promise = event.getEventType('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve a single event type name', async () => {
        const promise = event.getEventType('joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve a single event type on a closed database', async () => {
        db.setDBState(false);
        const promise = event.getEventType('1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve all prices for an event type', async () => {
        const promise = event.getEventTypePricesByEvent('Joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all prices for an event by event type id', async () => {
        const promise = event.getEventTypePricesByEvent('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve all prices for an event type on a closed database', async () => {
        db.setDBState(false);
        const promise = event.getEventTypePricesByEvent('Joris');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Retrieve single product price for an event', async () => {
        const promise = event.getEventTypePricesByEventAndProduct('Joris', '1');
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve single product price for an event with ID's", async () => {
        const promise = event.getEventTypePricesByEventAndProduct('1', '1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single product price for an event with names', async () => {
        const promise = event.getEventTypePricesByEventAndProduct('Joris', 'Joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single product price for an event by event id', async () => {
        const promise = event.getEventTypePricesByEventAndProduct('1', 'Joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Retrieve single product price for an event on a closed database', async () => {
        db.setDBState(false);
        const promise = event.getEventTypePricesByEventAndProduct('Joris', '1');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test('Update event type name.', async () => {
        const promise = event.updateEventType('Joris', 'new Type');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update event type name by ID.', async () => {
        const promise = event.updateEventType('1', 'new Type');
        await expect(promise).resolves.toBeDefined();
    });

    test('Update event type name already exists.', async () => {
        db.setIndexToUse(1);
        const promise = event.updateEventType('Joris', 'new Type');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update event type name not found.', async () => {
        db.setIndexToUse(2);
        const promise = event.updateEventType('Joris', 'new Type');
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update event type name failed.', async () => {
        db.setDBState(false);
        const promise = event.updateEventType('Joris', 'new Type');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Update Event Type Prices', async () => {
        const promise = event.updateEventTypePrices('Joris', 'ProductID', 100);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update Event Type Prices by event type id', async () => {
        const promise = event.updateEventTypePrices('1', 'ProductID', 100);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update Event Type Prices by product id', async () => {
        const promise = event.updateEventTypePrices('Joris', '1', 100);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update Event Type Prices by id', async () => {
        const promise = event.updateEventTypePrices('1', '1', 100);
        await expect(promise).resolves.toBeDefined();
    });

    test('Update non-existing event type price', async () => {
        db.setIndexToUse(2);
        const promise = event.updateEventTypePrices('1', '1', 100);
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test('Update event type price by id no data change', async () => {
        db.setIndexToUse(1);
        const promise = event.updateEventTypePrices('1', '1', 100);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test('Update existing event type prices by id on closed server', async () => {
        db.setDBState(false);
        const promise = event.updateEventTypePrices('1', '1', 100);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test('Delete event type.', async () => {
        const promise = event.deleteEventType('Joris');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete product by ID.', async () => {
        const promise = event.deleteEventType('1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete product failed.', async () => {
        db.setDBState(false);
        const promise = event.deleteEventType('Joris');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test('Delete event type type price entry by names', async () => {
        const promise = event.deleteEventTypePrice('Joris', 'Product');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete event type price entry by event type name and product id', async () => {
        const promise = event.deleteEventTypePrice('Joris', '1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete event type price entry by event type id and product name', async () => {
        const promise = event.deleteEventTypePrice('1', 'Product');
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete event type price entry by id's", async () => {
        const promise = event.deleteEventTypePrice('1', '1');
        await expect(promise).resolves.toBeDefined();
    });

    test('Delete event type price entry by names on a closed database', async () => {
        db.setDBState(false);
        const promise = event.deleteEventTypePrice('Joris', 'Product');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});
