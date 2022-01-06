import EventTypeQueries from "../../queries/EventTypeQueries";
import { MockDatabase } from "../../model/MockDatabase";
import { queryType } from "../../app";
import { GeneralServerError } from "../../exceptions/GeneralServerError";
import { ItemAlreadyExistsError } from "../../exceptions/ItemAlreadyExistsError";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";
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
    });

    //
    // ------------------------- Create statements test -------------------------
    //

    test("Create an event type", async () => {
        const promise = event.createNewEventType('EventType');
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test("Create a duplicate event type", async () => {
        db.setDuplicateInsert(true);
        const promise = event.createNewEventType('EventType');
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });


    test("Create an event type on a closed database", async () => {
        db.setDBState(false);
        const promise = event.createNewEventType('EventType');
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("Retrieve all event types", async () => {
        const promise = event.getAllEventTypes();
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve all event types on a closed database", async () => {
        db.setDBState(false);
        const promise = event.getAllEventTypes();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Retrieve a single event type", async () => {
        const promise = event.getEventType("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve a single event type name", async () => {
        const promise = event.getEventType("joris");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve a single event type on a closed database", async () => {
        db.setDBState(false);
        const promise = event.getEventType("1");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test("Update event type name.", async () => {
        const promise = event.updateEventType("Joris","new Type");
        await expect(promise).resolves.toBeDefined();
    });

    test("Update event type name by ID.", async () => {
        const promise = event.updateEventType("1","new Type");
        await expect(promise).resolves.toBeDefined();
    });


    test("Update event type name already exists.", async () => {
        db.setIndexToUse(1);
        const promise = event.updateEventType("Joris","new Type");
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test("Update event type name not found.", async () => {
        db.setIndexToUse(2);
        const promise = event.updateEventType("Joris","new Type");
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test("Update event type name failed.", async () => {
        db.setDBState(false);
        const promise = event.updateEventType("Joris","new Type");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test("Delete event type.", async () => {
        const promise = event.deleteEventType("Joris");
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete product by ID.", async () => {
        const promise = event.deleteEventType("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete product failed.", async () => {
        db.setDBState(false);
        const promise = event.deleteEventType("Joris");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
});