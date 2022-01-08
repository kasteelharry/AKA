import { queryType } from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";


export default class EventsQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    createNewEvent = (name: string, eventType: string, startTime: string | undefined, endTime?: string, saved?: string): Promise<any> => {
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

    setEventPrices = (eventID: string, ProductID: string, unitPrice: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) " +
                "VALUES(?,?,?)";
            const queryB = "INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) " +
                "VALUES((SELECT et.id FROM ak_events et.name = ?),?,?)";
            const queryC = "INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) " +
                "VALUES(?,(SELECT p.id FROM ak_products p WHERE p.name = ?),?)";
            const queryD = "INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) " +
                "VALUES((SELECT et.id FROM ak_events et WHERE et.name = ?)," +
                "(SELECT p.id FROM ak_products p WHERE p.name = ?),?)";
            let query = "";
            const eventNum = parseInt(eventID, 10);
            const productNum = parseInt(ProductID, 10);
            if (isNaN(eventNum) && isNaN(productNum)) {
                query = queryD;
            } else if (isNaN(eventNum)) {
                query = queryB;
            } else if (isNaN(productNum)) {
                query = queryC;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventID, ProductID, unitPrice]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Given product for given event already exists."));
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

    getAllEvents = (): Promise<any> => {
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

    getActiveEvent = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM ak_events e " +
                "WHERE e.StartTime < CURRENT_TIMESTAMP() " +
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

    getEvent = (eventID: string): Promise<any> => {
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

    getEventPricesByEvent = (eventID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            // const queryA = "SELECT * FROM ak_eventprice e WHERE e.EventID = ?";
            const queryA = "SELECT e.id as eventID, e.name as eventName, et.name as eventType, "
                + "p.name as product, "
                + "CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price, p.archived "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID "
                + "INNER JOIN ak_eventTypes et "
                + "ON e.EventTypeID = et.ID "
                + "WHERE e.ID = ? "
                + "ORDER BY e.id";
            const queryB = "SELECT e.id as event, et.name as event, "
                + "p.name as product, "
                + "CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID "
                + "WHERE e.name = ?";
            let query = "";
            const eventNum = parseInt(eventID, 10);
            if (isNaN(eventNum)) {
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
                    const json = val[1].result;
                    const newResult = {
                        eventID: json[0].eventID,
                        eventName: json[0].eventName,
                        eventType: json[0].eventType,
                        prices: [{}]
                    };
                    newResult.prices.pop();
                    for (const res of json) {
                            const priceEntry = {
                                product: res.product,
                                price: res.price,
                                archived: res.archived
                            };
                            newResult.prices.push(priceEntry);
                    }
                    resolve(newResult);
                }).catch(
                    err => {
                        reject(err);
                    }
                );
        });
    }

    getEventPricesByEventAndProduct = (eventTypeID:string, productID:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "SELECT e.id as eventID, e.name as eventName, et.name as eventType, "
            + "p.name as product, "
            + "CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price, p.archived "
            + "FROM ak_events e "
            + "LEFT JOIN ak_eventTypePrice ep "
            + "ON e.EventTypeID=ep.EventTypeID "
            + "LEFT JOIN ak_eventPrice eps "
            + "ON eps.EventID = e.ID "
            + "AND eps.ProductID = ep.ProductID "
            + "LEFT JOIN ak_products p "
            + "ON ep.ProductID = p.ID "
            + "INNER JOIN ak_eventTypes et "
            + "ON e.EventTypeID = et.ID "
            +"WHERE et.ID = ? AND ep.ProductID = ?";
        const queryB = "SELECT e.id as event, et.name as event, "
            + "p.name as product, "
            + "CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            + "FROM ak_events e "
            + "LEFT JOIN ak_eventTypePrice ep "
            + "ON e.EventTypeID=ep.EventTypeID "
            + "LEFT JOIN ak_eventPrice eps "
            + "ON eps.EventID = e.ID "
            + "AND eps.ProductID = ep.ProductID "
            + "LEFT JOIN ak_products p "
            + "ON ep.ProductID = p.ID "
            + "WHERE e.name = ? AND ep.ProductID = ?";
            const queryC = "SELECT e.id as eventID, e.name as eventName, et.name as eventType, "
            + "p.name as product, "
            + "CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price, p.archived "
            + "FROM ak_events e "
            + "LEFT JOIN ak_eventTypePrice ep "
            + "ON e.EventTypeID=ep.EventTypeID "
            + "LEFT JOIN ak_eventPrice eps "
            + "ON eps.EventID = e.ID "
            + "AND eps.ProductID = ep.ProductID "
            + "LEFT JOIN ak_products p "
            + "ON ep.ProductID = p.ID "
            + "INNER JOIN ak_eventTypes et "
            + "ON e.EventTypeID = et.ID "
            +"WHERE et.ID = ? AND p.name = ?";
        const queryD = "SELECT e.id as event, et.name as event, "
            + "p.name as product, "
            + "CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            + "FROM ak_events e "
            + "LEFT JOIN ak_eventTypePrice ep "
            + "ON e.EventTypeID=ep.EventTypeID "
            + "LEFT JOIN ak_eventPrice eps "
            + "ON eps.EventID = e.ID "
            + "AND eps.ProductID = ep.ProductID "
            + "LEFT JOIN ak_products p "
            + "ON ep.ProductID = p.ID "
            + "WHERE e.name = ? AND p.name = ?";
            let query = "";
            const eventNum = parseInt(eventTypeID, 10);
            const productNum = parseInt(productID, 10);
            if (isNaN(eventNum) && isNaN(productNum)) {
                query = queryD;
            } else if (isNaN(eventNum)) {
                query = queryB;
            } else if (isNaN(productNum)) {
                query = queryC;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventTypeID, productID]
                }
            ]).then(
                val => {
                    resolve(val[1].result[0]);
                }).catch(
                    err => {
                        reject(err);
                    }
                );
        });
    }

    //
    // ------------------------- Update statements -------------------------
    //

    updateEvent = (eventID: string, params: Map<string, string | number | undefined>): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "UPDATE ak_events e " +
                "SET e.name = COALESCE(?, e.name), " +
                "e.EventTypeID = COALESCE(?, e.EventTypeID), " +
                "e.StartTime = COALESCE(?, e.StartTime), " +
                "e.EndTime = COALESCE(?, e.EndTime), " +
                "e.Saved = COALESCE(?, e.Saved) " +
                "WHERE e.ID = ?;";
            const queryB = "UPDATE ak_events e " +
                "SET e.name = COALESCE(?, e.name), " +
                "e.EventTypeID = COALESCE(?, e.EventTypeID), " +
                "e.StartTime = COALESCE(?, e.StartTime), " +
                "e.EndTime = COALESCE(?, e.EndTime), " +
                "e.Saved = COALESCE(?, e.Saved) " +
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

    saveEvent = (eventID: string, saved: string): Promise<any> => {
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

    updateEventPrices = (eventID: string, productID: string, price: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "UPDATE ak_eventprice et SET "
                + "et.price = COALESCE(?, et.price) WHERE et.EventID = ? AND et.productID = ?";
            const queryB = "UPDATE ak_eventprice et SET "
                + "et.price = COALESCE(?, et.price) WHERE et.EventID = "
                + "(SELECT e.id FROM ak_events WHERE e.name = ?) AND et.productID = ?;";
            const queryC = "UPDATE ak_eventprice et SET "
                + "et.price = COALESCE(?, et.price) WHERE et.EventID = ? AND "
                + "(SELECT p.id FROM ak_products WHERE e.name = ?);";
            const queryD = "UPDATE ak_eventprice et SET "
                + "et.price = COALESCE(?, et.price) WHERE et.EventID = "
                + "(SELECT e.id FROM ak_events WHERE e.name = ?) AND "
                + "(SELECT p.id FROM ak_products WHERE e.name = ?);";
            const queryE = "SELECT * FROM ak_eventprice p WHERE p.EventID = ? AND et.productID = ?";
            const queryF = "SELECT * FROM ak_events p WHERE p.EventID = "
                + "(SELECT e.id FROM ak_events WHERE e.name = ?) AND et.productID = ?";
            const queryG = "SELECT * FROM ak_eventprice p WHERE p.EventID = ? AND et.productID = "
                + "(SELECT p.id FROM ak_products WHERE e.name = ?);";
            const queryH = "SELECT * FROM ak_events p WHERE p.EventID = "
                + "(SELECT e.id FROM ak_events WHERE e.name = ?) AND et.productID = "
                + "(SELECT p.id FROM ak_products WHERE e.name = ?);";
            let queryToPerform = "";
            let secondQuery = "";
            const eventNum = parseInt(eventID, 10);
            const productNum = parseInt(productID, 10);
            if (isNaN(eventNum) && isNaN(productNum)) {
                queryToPerform = queryD;
                secondQuery = queryH;
            } else if (isNaN(eventNum)) {
                queryToPerform = queryB;
                secondQuery = queryF;
            } else if (isNaN(productNum)) {
                queryToPerform = queryC;
                secondQuery = queryG;
            } else {
                queryToPerform = queryA;
                secondQuery = queryE;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [price, eventID, productID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [eventID, productID]
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

    deleteEvent = (eventID: string): Promise<any> => {
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

    deleteEventPrice = (eventID: string, productID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "SELECT * FROM ak_eventprice e WHERE e.EventID = ? and e.ProductID = ?";
            const queryB = "SELECT * FROM ak_eventprice e WHERE e.EventID = " +
                "(SELECT et.id FROM ak_events et WHERE et.name = ?) and e.ProductID = ?";
            const queryC = "SELECT * FROM ak_eventprice e WHERE e.EventID = " +
                "? and e.ProductID = (SELECT p.id FROM ak_products WHERE e.name = ?)";
            const queryD = "SELECT * FROM ak_eventprice e WHERE e.EventID = " +
                "(SELECT et.id FROM ak_events et WHERE et.name = ?) "
                + "and e.ProductID = (SELECT p.id FROM ak_products WHERE e.name = ?)";
            let query = "";
            const eventNum = parseInt(eventID, 10);
            const productNum = parseInt(productID, 10);
            if (isNaN(eventNum) && isNaN(productNum)) {
                query = queryD;
            } else if (isNaN(eventNum)) {
                query = queryB;
            } else if (isNaN(productNum)) {
                query = queryC;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventID, productID]
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