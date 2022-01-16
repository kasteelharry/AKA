import { queryType } from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";

export default class FlowStandQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Creates a new record in the database where it can keep track of the flow meter counter.
     * This can later be used in combination with the transactions to calculate the tap loss.
     * @param eventID - The ID of the event.
     * @param start - The starting count of the flow meter.
     * @param end - The end count of the flow meter (optional)
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createNewFlowStand = (eventID: number, start: number, end?: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO ak_flowstand (EventID, StartCount, EndCount) "
                + "VALUES(?,?,?)";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventID, start, end]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Flow stand for " + eventID + " already exists."));
                        } else {
                            reject(err);
                        }
                    }
                );
        });
    }

    //
    // ------------------------- Retrieve statements -------------------------
    //

    /**
     * Retrieves all the entries in the database for the flow stand.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllFlowStand = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT f.EventID, e.name, f.StartCount, f.EndCount FROM ak_flowstand f "
                + "LEFT JOIN ak_events e "
                + "ON f.EventID = e.id;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: []
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                    err => reject(err)
                );
        });
    }

    /**
     * Retrieves the single entry for the event in the table for the flow meter.
     * @param eventID - The ID or name of the event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getFlowStandByEvent = (eventID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "SELECT f.EventID, e.name, f.StartCount, f.EndCount FROM ak_flowstand f "
                + "LEFT JOIN ak_events e "
                + "ON f.EventID = e.id"
                + "WHERE f.EventID = ?";
            const queryB = "SELECT f.EventID, e.name, f.StartCount, f.EndCount FROM ak_flowstand f "
                + "LEFT JOIN ak_events e "
                + "ON f.EventID = e.id "
                + "WHERE e.name = ?";
            let queryToPerform = "";
            const numberID = parseInt(eventID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryB;
            } else {
                queryToPerform = queryA;
            }

            this.database.executeTransactions([

                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [eventID]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                    err => reject(err)
                );
        });
    }

    //
    // ------------------------- Update statements -------------------------
    //

    /**
     * Updates the flow stand with the new values. If only the final count needs to be
     * recorded, a null or undefined value should be set for the start parameter.
     * @param eventID - The ID or name of the event.
     * @param start - The new starting count (Optional)
     * @param end - The new end count (Optional)
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateFlowStand = (eventID: string, start?: number, end?: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "UPDATE ak_flowstand f SET '"
                + "f.StartCount = COALESCE(?, f.StartCount), "
                + "f.EndCount = COALESCE(?, f.EndCount) "
                + "WHERE f.EventID = ?;";
            const queryB = "UPDATE ak_flowstand f SET '"
                + "f.StartCount = COALESCE(?, f.StartCount), "
                + "f.EndCount = COALESCE(?, f.EndCount) "
                + "WHERE f.EventID =  "
                + "(SELECT e.id FROM ak_events e WHERE e.name = ?);";
            const queryC = "SELECT f.EventID, e.name, f.StartCount, f.EndCount FROM ak_flowstand f "
                + "LEFT JOIN ak_events e "
                + "ON f.EventID = e.id"
                + "WHERE f.EventID = ?";
            const queryD = "SELECT f.EventID, e.name, f.StartCount, f.EndCount FROM ak_flowstand f "
                + "LEFT JOIN ak_events e "
                + "ON f.EventID = e.id "
                + "WHERE e.name = ?";
            let query = "";
            let secondQuery = "";
            const numberID = parseInt(eventID, 10);
            if (isNaN(numberID)) {
                query = queryB;
                secondQuery = queryD;
            } else {
                query = queryA;
                secondQuery = queryC;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [start, end, eventID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [eventID]
                }
            ]).then(
                val => {
                    const queryResults = val[1].result;
                    if (queryResults.changedRows === 1) {
                        resolve(val[2].result);
                    } else if (queryResults.affectedRows === 1) {
                        reject(new ItemAlreadyExistsError());
                    } else {
                        reject(new EmptySQLResultError('Was unable to find a match for the id.'));
                    }
                }).catch(
                    err => reject(err)
                );
        });
    }

    //
    // ------------------------- Delete statements -------------------------
    //

    /**
     * Deletes an entry for the given event in the table that keeps track of the flow meter.
     * @param eventID - The ID or name of the event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteFlowstand = (eventID:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "DELETE FROM ak_flowstand f WHERE f.EventID = ?";
            const queryB = "DELETE FROM ak_flowstand f WHERE f.EventID = "
            +"(SELECT e.id FROM ak_events e WHERE e.name = ?)";
            let query = "";
            const numberID = parseInt(eventID, 10);
            if (isNaN(numberID)) {
                query = queryB;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventID]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                    err => reject(err)
                );
        });
    }
}