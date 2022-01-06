import { EmptySQLResultError } from "../exceptions/EmptySQLResultError";
import { queryType } from "../app";
import { ItemAlreadyExistsError } from "../exceptions/ItemAlreadyExistsError";

export default class EventTypeQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    createNewEventType = (name:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "INSERT INTO ak_eventtypes (Name) VALUES (?);";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [name]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
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

    getAllEventTypes = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            this.database.executeTransactions([
                {
                    id: 1,
                    query: "SELECT * FROM ak_eventtypes",
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

    getEventType = (eventTypeID:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "SELECT * FROM ak_eventtypes p WHERE p.id = ?;";
            const queryTwo = "SELECT * FROM ak_eventtypes p WHERE p.name LIKE ?";
            let query = "";
            const numberID = parseInt(eventTypeID, 10);
            if (isNaN(numberID)) {
                query = queryTwo;
                eventTypeID = '%' + eventTypeID + '%';
            } else {
                query = queryOne;
            }
            this.database.executeTransactions([

                {
                    id: 1,
                    query,
                    parameters: [eventTypeID]
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

    updateEventType = (eventTypeID: string, newName: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "UPDATE ak_eventtypes p SET p.name = ? WHERE p.id = ?;";
            const queryTwo = "UPDATE ak_eventtypes p SET p.name = ? WHERE p.name LIKE ?";
            const queryThree = "SELECT * FROM ak_eventtypes p WHERE p.id = ?;";
            const queryFour = "SELECT * FROM ak_eventtypes p WHERE p.name LIKE ?";
            let queryToPerform = "";
            let secondQuery = "";
            const numberID = parseInt(eventTypeID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                secondQuery = queryFour;
                eventTypeID = '%' + eventTypeID + '%';
            } else {
                queryToPerform = queryOne;
                secondQuery = queryThree;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [newName, eventTypeID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [eventTypeID]
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

    deleteEventType = (eventTypeID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "DELETE FROM ak_eventtypes p WHERE p.id = ?;";
            const queryTwo = "DELETE FROM ak_eventtypes p WHERE p.name LIKE ?";
            let queryToPerform = "";
            const numberID = parseInt(eventTypeID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                eventTypeID = '%' + eventTypeID + '%';
            } else {
                queryToPerform = queryOne;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [eventTypeID]
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