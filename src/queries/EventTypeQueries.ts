import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { queryType } from "@dir/app";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import e from "express";

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

    setEventTypePrices = (eventTypeID:string, ProductID:string, unitPrice:number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "INSERT INTO ak_eventtypeprice e (EventTypeID, ProductID, UnitPrice) "+
            "VALUES(?,?,?)";
            const queryB = "INSERT INTO ak_eventtypeprice e (EventTypeID, ProductID, UnitPrice) "+
            "VALUES((SELECT et.id FROM ak_eventTypes et.name = ?),?,?)";
            const queryC = "INSERT INTO ak_eventtypeprice e (EventTypeID, ProductID, UnitPrice) "+
            "VALUES(?,(SELECT p.id FROM ak_products p WHERE p.name = ?),?)";
            const queryD = "INSERT INTO ak_eventtypeprice e (EventTypeID, ProductID, UnitPrice) "+
            "VALUES((SELECT et.id FROM ak_eventTypes et WHERE et.name = ?),"+
            "(SELECT p.id FROM ak_products p WHERE p.name = ?),?)";
            let query = "";
            const eventNum = parseInt(eventTypeID, 10);
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
                    parameters: [eventTypeID,ProductID,unitPrice]
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


    getEventTypePricesByEvent = (eventTypeID:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "SELECT et.id as eventID, et.name as eventType, "
            +"p.name as product, ep.UnitPrice as price, p.archived "
            +"FROM ak_eventTypes et "
            +"LEFT JOIN ak_eventtypeprice ep "
            +"ON ep.EventTypeID = et.ID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.ID = ?";
            const queryB = "SELECT et.id as eventID, et.name as eventType, "
            +"p.name as product, ep.UnitPrice as price, p.archived "
            +"FROM ak_eventTypes et "
            +"LEFT JOIN ak_eventtypeprice ep "
            +"ON ep.EventTypeID = et.ID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.name = ?";
            let query = "";
            const eventNum = parseInt(eventTypeID, 10);
            if (isNaN(eventNum)) {
                query = queryB;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventTypeID]
                }
            ]).then(
                val => {
                    const json = val[1].result;
                    const newResult = {
                        eventTpeID: json[0].eventTpeID,
                        eventType: json[0].eventType,
                        prices: [{}]
                    };
                    newResult.prices.pop();
                    for (const res of json) {
                            const priceEntry = {
                                product: res.product,
                                price: res.price,
                                archived:res.archived
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

    getEventTypePricesByEventAndProduct = (eventTypeID:string, productID:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "SELECT et.id as eventID, et.name as eventType, "
            +"p.name as product, ep.UnitPrice as price, p.archived "
            +"FROM ak_eventTypes et "
            +"LEFT JOIN ak_eventtypeprice ep "
            +"ON ep.EventTypeID = et.ID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.ID = ? AND ep.ProductID = ?";
            const queryB = "SELECT et.id as eventID, et.name as eventType, "
            +"p.name as product, ep.UnitPrice as price, p.archived "
            +"FROM ak_eventTypes et "
            +"LEFT JOIN ak_eventtypeprice ep "
            +"ON ep.EventTypeID = et.ID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.name = ? AND p.Name = ?";
            const queryC = "SELECT et.id as eventID, et.name as eventType, "
            +"p.name as product, ep.UnitPrice as price, p.archived "
            +"FROM ak_eventTypes et "
            +"LEFT JOIN ak_eventtypeprice ep "
            +"ON ep.EventTypeID = et.ID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.ID = ? AND p.Name = ?";
            const queryD = "SELECT et.id as eventID, et.name as eventType, "
            +"p.name as product, ep.UnitPrice as price, p.archived "
            +"FROM ak_eventTypes et "
            +"LEFT JOIN ak_eventtypeprice ep "
            +"ON ep.EventTypeID = et.ID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.name = ? AND ep.ProductID = ?";
            let query = "";
            const eventNum = parseInt(eventTypeID, 10);
            const productNum = parseInt(productID, 10);
            if (isNaN(eventNum) && isNaN(productNum)) {
                query = queryB;
            } else if (isNaN(eventNum)) {
                query = queryD;
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

    updateEventTypePrices = (eventTypeID:string, productID:string, price?:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "UPDATE ak_eventtypeprice et SET "
            +"et.price = COALESCE(?, et.price) WHERE et.EventTypeID = ? AND et.productID = ?";
            const queryB = "UPDATE ak_eventtypeprice et SET "
            +"et.price = COALESCE(?, et.price) WHERE et.EventTypeID = "
            +"(SELECT e.id FROM ak_eventtypes WHERE e.name = ?) AND et.productID = ?;";
            const queryC = "UPDATE ak_eventtypeprice et SET "
            +"et.price = COALESCE(?, et.price) WHERE et.EventTypeID = ? AND "
            +"(SELECT p.id FROM ak_products WHERE e.name = ?);";
            const queryD = "UPDATE ak_eventtypeprice et SET "
            +"et.price = COALESCE(?, et.price) WHERE et.EventTypeID = "
            +"(SELECT e.id FROM ak_eventtypes WHERE e.name = ?) AND "
            +"(SELECT p.id FROM ak_products WHERE e.name = ?);";

            const queryE = "SELECT et.id as eventID, et.name as eventType, p.name, ep.UnitPrice, p.archived FROM ak_eventtypeprice ep "
            +"INNER JOIN ak_eventTypes et "
            +"ON ep.EventTypeID = et.ID "
            +"INNER JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE p.EventID = ? AND et.productID = ?";
            const queryF = "SELECT et.id as eventID, et.name as eventType, p.name, ep.UnitPrice, p.archived FROM ak_eventtypeprice ep "
            +"INNER JOIN ak_eventTypes et "
            +"ON ep.EventTypeID = et.ID "
            +"INNER JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.name = ?"
            // +"(SELECT e.id FROM ak_eventtypes WHERE e.name = ?) "
            +"AND et.productID = ?";
            const queryG = "SELECT et.id as eventID, et.name as eventType, p.name, ep.UnitPrice, p.archived FROM ak_eventtypeprice ep "
            +"INNER JOIN ak_eventTypes et "
            +"ON ep.EventTypeID = et.ID "
            +"INNER JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE ep.EventID = ? AND p.name = ?";
            // +"(SELECT p.id FROM ak_products WHERE e.name = ?);";
            const queryH ="SELECT et.id as eventID, et.name as eventType, p.name, ep.UnitPrice, p.archived FROM ak_eventtypeprice ep "
            +"INNER JOIN ak_eventTypes et "
            +"ON ep.EventTypeID = et.ID "
            +"INNER JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"WHERE et.name = ?"
            // +"(SELECT e.id FROM ak_eventtypes WHERE e.name = ?) "
            +"AND p.name = ?";
            // +"(SELECT p.id FROM ak_products WHERE e.name = ?);";
            let queryToPerform = "";
            let secondQuery = "";
            const eventNum = parseInt(eventTypeID, 10);
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
                    parameters: [price, eventTypeID, productID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [eventTypeID, productID]
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

    deleteEventTypePrice = (eventTypeID:string, productID:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "DELETE FROM ak_eventtypeprice e WHERE e.EventTypeID = ? and e.ProductID = ?";
            const queryB = "DELETE FROM ak_eventtypeprice e WHERE e.EventTypeID = "+
            "(SELECT et.id FROM ak_eventTypes et WHERE et.name = ?) and e.ProductID = ?";
            const queryC = "DELETE FROM ak_eventtypeprice e WHERE e.EventTypeID = "+
            "? and e.ProductID = (SELECT p.id FROM ak_products WHERE e.name = ?)";
            const queryD = "DELETE FROM ak_eventtypeprice e WHERE e.EventTypeID = "+
            "(SELECT et.id FROM ak_eventTypes et WHERE et.name = ?) "
            +"and e.ProductID = (SELECT p.id FROM ak_products WHERE e.name = ?)";
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
                    resolve(val[1].result);
                }).catch(
                    err => reject(err)
                );
        });
    }
}