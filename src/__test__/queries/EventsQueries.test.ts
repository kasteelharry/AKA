import { MockDatabase } from "@dir/model/MockDatabase";
import { queryType } from "@dir/app";
import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import EventQueries from "@dir/queries/EventsQueries";
import { convertStringToSQLDate } from "@dir/util/ConvertStringToSQLDate";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";

describe('EventQueriesTest', () => {
    let event: EventQueries;
    let db: MockDatabase<queryType>;

    beforeAll(() => {
        db = new MockDatabase();
        event = new EventQueries(db);
    });

    beforeEach(() => {
        db.setDBState(true);
        db.setDuplicateInsert(false);
        db.setIndexToUse(0);
    });

    //
    // ------------------------- Create statements test -------------------------
    //
    test("Create an event", async () => {
        const promise = event.createNewEvent('EventName', "1", convertStringToSQLDate("2000-01-01 12:00:00"), undefined, "false");
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test("Create an event with type name", async () => {
        const promise = event.createNewEvent('EventName', "Joris", convertStringToSQLDate("2000-01-01 12:00:00"));
        await expect(promise).resolves.toBeGreaterThanOrEqual(1);
    });

    test("Create a duplicate event", async () => {
        db.setDuplicateInsert(true);
        const promise = event.createNewEvent('EventName', "1", convertStringToSQLDate("2000-01-01 12:00:00"), undefined, "true");
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });


    test("Create an event on a closed database", async () => {
        db.setDBState(false);
        const promise = event.createNewEvent('EventName', "1", convertStringToSQLDate("2000-01-01 12:00:00"), undefined, "false");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });
    //
    // ------------------------- Retrieve statements test -------------------------
    //

    test("Retrieve all event", async () => {
        const promise = event.getAllEvents();
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve all event on a closed database", async () => {
        db.setDBState(false);
        const promise = event.getAllEvents();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Retrieve a single event", async () => {
        const promise = event.getEvent("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve a single event name", async () => {
        const promise = event.getEvent("joris");
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve a single event on a closed database", async () => {
        db.setDBState(false);
        const promise = event.getEvent("1");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Retrieve all active events", async () => {
        const promise = event.getActiveEvent();
        await expect(promise).resolves.toBeDefined();
    });

    test("Retrieve all active events on a closed database", async () => {
        db.setDBState(false);
        const promise = event.getActiveEvent();
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Update statements test -------------------------
    //

    test("Update existing past event by name", async () => {
        const params = new Map<string, string | number | undefined>();
        params.set("name", "Joris");
        params.set("eventType", 1);
        params.set("startTime", convertStringToSQLDate("2000-01-01 22:22:22"));
        params.set("endTime", convertStringToSQLDate("2000-01-02 22:22:22"));
        params.set("saved", "true");
        const promise = event.updateEvent("Joris", params);
        await expect(promise).resolves.toBeDefined();
    });

    test("Update existing upcoming event by name", async () => {
        const params = new Map<string, string | number | undefined>();
        params.set("name", "Joris");
        params.set("eventType", 1);
        params.set("startTime", convertStringToSQLDate("2000-01-01 22:22:22"));
        params.set("endTime", convertStringToSQLDate("2000-01-02 22:22:22"));
        params.set("saved", "false");
        const promise = event.updateEvent("Joris", params);
        await expect(promise).resolves.toBeDefined();
    });

    test("Update existing event by id", async () => {
        const params = new Map<string, string | number | undefined>();
        const promise = event.updateEvent("1", params);
        await expect(promise).resolves.toBeDefined();
    });
    test("Update existing event by id no data change", async () => {
        db.setIndexToUse(1);
        const params = new Map<string, string | number | undefined>();
        const promise = event.updateEvent("1", params);
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test("Update existing event by id on closed server", async () => {
        db.setDBState(false);
        const params = new Map<string, string | number | undefined>();
        const promise = event.updateEvent("1", params);
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    test("Update non-existing event", async () => {
        db.setIndexToUse(2);
        const params = new Map<string, string | number | undefined>();
        const promise = event.updateEvent("1", params);
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test("Save an event by name", async () => {
        const promise = event.saveEvent("Joris", "true");
        await expect(promise).resolves.toBeDefined();
    });

    test("Save an event by id", async () => {
        const promise = event.saveEvent("1", "false");
        await expect(promise).resolves.toBeDefined();
    });

    test("Save an event by id no data change", async () => {
        db.setIndexToUse(1);
        const promise = event.saveEvent("1", "true");
        await expect(promise).rejects.toBeInstanceOf(ItemAlreadyExistsError);
    });

    test("Save a non-existing event", async () => {
        db.setIndexToUse(2);
        const promise = event.saveEvent("Joris", "true");
        await expect(promise).rejects.toBeInstanceOf(EmptySQLResultError);
    });

    test("Save event by id on closed server", async () => {
        db.setDBState(false);
        const promise = event.saveEvent("1", "true");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

    //
    // ------------------------- Delete statements test -------------------------
    //

    test("Delete event by id", async () => {
        const promise = event.deleteEvent("1");
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete event by name", async () => {
        const promise = event.deleteEvent("Joris");
        await expect(promise).resolves.toBeDefined();
    });

    test("Delete event by name on closed database", async () => {
        db.setDBState(false);
        const promise = event.deleteEvent("Joris");
        await expect(promise).rejects.toBeInstanceOf(GeneralServerError);
    });

});