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