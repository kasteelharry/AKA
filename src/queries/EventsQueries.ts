import { queryType } from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";


export default class EventQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    createNewEvent = (name:string, eventType:string, startTime:string | undefined, endTime?:string, saved?:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "INSERT INTO ak_events (Name, EventTypeID, StartTime, EndTime, Saved) " +
            "VALUES (?,?,?,?,?);";
            const queryB = "INSERT INTO ak_events (Name, EventTypeID, StartTime, EndTime, Saved) VALUES(?, (SELECT t.id FROM ak_eventtypes t WHERE t.name = ?), ?, ?, ?);";
            let query = "";
            const numberID = parseInt(eventType, 10);
            if (isNaN(numberID)) {
                query = queryB;
            } else {
                query = queryA;
            }
            const savedNum = saved === undefined ? 0 : (saved === "true" ? 1 : 0);
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [name, eventType, startTime, endTime, savedNum]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err =>  {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Given event " + name + " already exists."));
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

    getAllEvents = ():Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM ak_events";
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
                    err => {
                        reject(err);
                    }
                );
        });
    }

    getActiveEvent = ():Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM ak_events e "+
            "WHERE e.StartTime < CURRENT_TIMESTAMP() "+
            "AND ISNULL(e.EndTime) AND e.saved != 1;";
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
                    err => {
                        reject(err);
                    }
                );
        });
    }

    getEvent = (eventID:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "SELECT * FROM ak_events e WHERE e.id =?";
            const queryB = "SELECT * FROM ak_events e WHERE e.name LIKE ?";
            let query = "";
            const numberID = parseInt(eventID, 10);
            if (isNaN(numberID)) {
                query = queryB;
                eventID = '%' + eventID + '%';
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

    //
    // ------------------------- Update statements -------------------------
    //

    updateEvent = (eventID:string, params: Map<string, string | number | undefined>):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "UPDATE ak_events e "+
            "SET e.name = COALESCE(?, e.name), "+
            "e.EventTypeID = COALESCE(?, e.EventTypeID), "+
            "e.StartTime = COALESCE(?, e.StartTime), "+
            "e.EndTime = COALESCE(?, e.EndTime), "+
            "e.Saved = COALESCE(?, e.Saved) "+
            "WHERE e.ID = ?;";
            const queryB = "UPDATE ak_events e "+
            "SET e.name = COALESCE(?, e.name), "+
            "e.EventTypeID = COALESCE(?, e.EventTypeID), "+
            "e.StartTime = COALESCE(?, e.StartTime), "+
            "e.EndTime = COALESCE(?, e.EndTime), "+
            "e.Saved = COALESCE(?, e.Saved) "+
            "WHERE e.name = ?;";
            const queryC = "SELECT * FROM ak_events e WHERE e.id =?";
            const queryD = "SELECT * FROM ak_events e WHERE e.name =?";
            let queryOne = "";
            let queryTwo = "";
            const name = params.get("name") === undefined ? null : params.get("name");
            const finalID = name != null ? name : eventID;
            const eventTypeID = params.get("eventType") === undefined ? null : params.get("eventType");
            const startTime = params.get("startTime") === undefined ? null : params.get("startTime");
            const endTime = params.get("endTime") === undefined ? null : params.get("endTime");
            let saved = params.get("saved") === undefined ? null : params.get("saved");
            if (saved != null) {
                saved = (saved === "true") ? 1 : 0;
            }
            const numberID = parseInt(eventID, 10);
            if (isNaN(numberID)) {
                queryOne = queryB;
                queryTwo = queryD;
            } else {
                queryOne = queryA;
                queryTwo = queryC;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryOne,
                    parameters: [name, eventTypeID, startTime, endTime, saved, finalID]
                },
                {
                    id: 2,
                    query: queryTwo,
                    parameters: [finalID]
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

    saveEvent = (eventID: string, saved: string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "UPDATE ak_events e SET e.saved = ? WHERE e.id = ?;";
            const queryTwo = "UPDATE ak_events e SET e.saved = ? WHERE e.name = ?;";
            const queryThree = "SELECT * FROM ak_events e WHERE e.id = ?;";
            const queryFour = "SELECT * FROM ak_events e WHERE e.name = ?";
            let queryToPerform = "";
            let secondQuery = "";
            const savedNum = (saved === "true") ? 1 : 0;
            const numberID = parseInt(eventID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                secondQuery = queryFour;
            } else {
                queryToPerform = queryOne;
                secondQuery = queryThree;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [savedNum, eventID]
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
                        reject(new EmptySQLResultError('Was unable to find a match for the id or name.'));
                    }
                }).catch(
                    err => reject(err)
                );
        });
    }

    //
    // ------------------------- Delete statements -------------------------
    //

    deleteEvent = (eventID:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "DELETE FROM ak_events e WHERE e.id = ?";
            const queryB = "DELETE FROM ak_events e WHERE e.name = ?";
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