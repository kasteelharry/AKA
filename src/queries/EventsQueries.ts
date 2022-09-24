import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';

export default class EventsQueries {
    constructor (private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Creates a new event in the database. Once the event is created, new
     * custom prices can be set using the {@link setEventPrices} method. All
     * default prices will be retrieved from the event type. If the insertion
     * goes successful, the promise will be resolved with the insertion ID.
     * Otherwise it will be rejected with an error.
     * @param name - The name of the new event.
     * @param eventType - The type of the event.
     * @param startTime - The starting time of the event.
     * @param endTime (Optional) The time for when the event will end.
     * @param saved - Indicates if the event is saved or not.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createNewEvent = (name: string, eventType: string, startTime: string | undefined, endTime?: string, saved?: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'INSERT INTO ak_events (Name, EventTypeID, StartTime, EndTime, Saved) ' +
                'VALUES (?,?,?,?,?);';
            const queryB = 'INSERT INTO ak_events (Name, EventTypeID, StartTime, EndTime, Saved) VALUES(?, (SELECT t.id FROM ak_eventtypes t WHERE t.name = ?), ?, ?, ?);';
            let query = '';
            const numberID = parseInt(eventType, 10);
            if (isNaN(numberID)) {
                query = queryB;
            } else {
                query = queryA;
            }
            const savedNum = saved === undefined ? 0 : (saved === 'true' ? 1 : 0);
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
                    if (err.message.match('Duplicate entry')) {
                        reject(new ItemAlreadyExistsError('Given event ' + name + ' already exists.'));
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    /**
     * Sets the price of a product for a particular event. This price will override
     * the price that has been set for the event type, if that type has the product.
     * If the product has not an entry for the event type, it will use the custom price
     * set here. If the price can be set, the promise will resolve with the inserted ID.
     * Otherwise it will be rejected with an error.
     * @param eventID - The ID or name of the event.
     * @param ProductID - The ID or name of the product.
     * @param unitPrice - The price of a single product purchase in euro cents.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    setEventPrices = (eventID: string, ProductID: string, unitPrice: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) ' +
                'VALUES(?,?,?)';
            const queryB = 'INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) ' +
                'VALUES((SELECT et.id FROM ak_events et.name = ?),?,?)';
            const queryC = 'INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) ' +
                'VALUES(?,(SELECT p.id FROM ak_products p WHERE p.name = ?),?)';
            const queryD = 'INSERT INTO ak_eventprice e (eventID, ProductID, UnitPrice) ' +
                'VALUES((SELECT et.id FROM ak_events et WHERE et.name = ?),' +
                '(SELECT p.id FROM ak_products p WHERE p.name = ?),?)';
            let query = '';
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
                    if (err.message.match('Duplicate entry')) {
                        reject(new ItemAlreadyExistsError('Given product for given event already exists.'));
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
     * Gets all the events from the database.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllEvents = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ak_events';
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

    /**
     * Retrieves all the currently ongoing events from the database. This does not load their prices,
     * that needs to be called after selecting an event. Saved events are not retrieved by this database
     * query.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getActiveEvent = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ak_events e ' +
                'WHERE e.StartTime < CURRENT_TIMESTAMP() ' +
                'AND ISNULL(e.EndTime) AND e.saved != 1;';
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

    /**
     * Retrieves the events from the database based on their name or ID.
     * @param eventID - The event ID or name.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getEvent = (eventID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'SELECT * FROM ak_events e WHERE e.id =?';
            const queryB = 'SELECT * FROM ak_events e WHERE e.name LIKE ?';
            let query = '';
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

    /**
     * Retrieves the products and all the prices that are associated to the event.
     * If the product has no price for the event, it is not loaded by this query.
     * @param eventID - The name or ID of an event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getEventPricesByEvent = (eventID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'SELECT e.id as eventID, e.name as eventName, et.name as eventType, ' +
                'p.name as product, p.id as productID, ' +
                'CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) ' +
                'THEN eps.UnitPrice ELSE ep.UnitPrice END AS price, p.archived ' +
                'FROM ak_events e ' +
                'LEFT JOIN ak_eventTypePrice ep ' +
                'ON e.EventTypeID=ep.EventTypeID ' +
                'LEFT JOIN ak_eventPrice eps ' +
                'ON eps.EventID = e.ID ' +
                'AND eps.ProductID = ep.ProductID ' +
                'LEFT JOIN ak_products p ' +
                'ON ep.ProductID = p.ID ' +
                'INNER JOIN ak_eventTypes et ' +
                'ON e.EventTypeID = et.ID ' +
                'WHERE e.ID = ? ' +
                'ORDER BY e.id';
            const queryB = 'SELECT e.id as event, et.name as event, ' +
                'p.name as product, p.id as productID, ' +
                'CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) ' +
                'THEN eps.UnitPrice ELSE ep.UnitPrice END AS price ' +
                'FROM ak_events e ' +
                'LEFT JOIN ak_eventTypePrice ep ' +
                'ON e.EventTypeID=ep.EventTypeID ' +
                'LEFT JOIN ak_eventPrice eps ' +
                'ON eps.EventID = e.ID ' +
                'AND eps.ProductID = ep.ProductID ' +
                'LEFT JOIN ak_products p ' +
                'ON ep.ProductID = p.ID ' +
                'WHERE e.name = ?';
            let query = '';
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

    /**
     * Retrieves a single price for a product for a certain event. If the event does not
     * have a price associated to the product, the promise will resolve empty.
     * @param eventTypeID - The ID or name of the event.
     * @param productID - The ID or name of the event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getEventPricesByEventAndProduct = (eventTypeID:string, productID:string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'SELECT e.id as eventID, e.name as eventName, et.name as eventType, ' +
            'p.name as product, p.id as productID, ' +
            'CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) ' +
            'THEN eps.UnitPrice ELSE ep.UnitPrice END AS price, p.archived ' +
            'FROM ak_events e ' +
            'LEFT JOIN ak_eventTypePrice ep ' +
            'ON e.EventTypeID=ep.EventTypeID ' +
            'LEFT JOIN ak_eventPrice eps ' +
            'ON eps.EventID = e.ID ' +
            'AND eps.ProductID = ep.ProductID ' +
            'LEFT JOIN ak_products p ' +
            'ON ep.ProductID = p.ID ' +
            'INNER JOIN ak_eventTypes et ' +
            'ON e.EventTypeID = et.ID ' +
            'WHERE et.ID = ? AND ep.ProductID = ?';
            const queryB = 'SELECT e.id as event, et.name as event, ' +
            'p.name as product, p.id as productID, ' +
            'CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) ' +
            'THEN eps.UnitPrice ELSE ep.UnitPrice END AS price ' +
            'FROM ak_events e ' +
            'LEFT JOIN ak_eventTypePrice ep ' +
            'ON e.EventTypeID=ep.EventTypeID ' +
            'LEFT JOIN ak_eventPrice eps ' +
            'ON eps.EventID = e.ID ' +
            'AND eps.ProductID = ep.ProductID ' +
            'LEFT JOIN ak_products p ' +
            'ON ep.ProductID = p.ID ' +
            'WHERE e.name = ? AND ep.ProductID = ?';
            const queryC = 'SELECT e.id as eventID, e.name as eventName, et.name as eventType, ' +
            'p.name as product, p.id as ProductID, ' +
            'CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) ' +
            'THEN eps.UnitPrice ELSE ep.UnitPrice END AS price, p.archived ' +
            'FROM ak_events e ' +
            'LEFT JOIN ak_eventTypePrice ep ' +
            'ON e.EventTypeID=ep.EventTypeID ' +
            'LEFT JOIN ak_eventPrice eps ' +
            'ON eps.EventID = e.ID ' +
            'AND eps.ProductID = ep.ProductID ' +
            'LEFT JOIN ak_products p ' +
            'ON ep.ProductID = p.ID ' +
            'INNER JOIN ak_eventTypes et ' +
            'ON e.EventTypeID = et.ID ' +
            'WHERE et.ID = ? AND p.name = ?';
            const queryD = 'SELECT e.id as event, et.name as event, ' +
            'p.name as product, p.id as productID, ' +
            'CASE WHEN EXISTS(SELECT * WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) ' +
            'THEN eps.UnitPrice ELSE ep.UnitPrice END AS price ' +
            'FROM ak_events e ' +
            'LEFT JOIN ak_eventTypePrice ep ' +
            'ON e.EventTypeID=ep.EventTypeID ' +
            'LEFT JOIN ak_eventPrice eps ' +
            'ON eps.EventID = e.ID ' +
            'AND eps.ProductID = ep.ProductID ' +
            'LEFT JOIN ak_products p ' +
            'ON ep.ProductID = p.ID ' +
            'WHERE e.name = ? AND p.name = ?';
            let query = '';
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

    /**
     * Updates an event based on the passed values in the parameters map. If an value
     * does not exist in the map, it will not be updated in the events table.
     * @param eventID - The id or name of the event.
     * @param params - The map containing the new values for the event. This map can contain:
     *  - **name** - The new name for the event.
     *  - **eventType** - The new Event Type.
     *  - **startTime** - The new starting time of the event.
     *  - **endTime** - The new ending time of the event.
     *  - **saved** - (true or false) The indication if the event is saved or not.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateEvent = (eventID: string, params: Map<string, string | number | undefined>): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'UPDATE ak_events e ' +
                'SET e.name = COALESCE(?, e.name), ' +
                'e.EventTypeID = COALESCE(?, e.EventTypeID), ' +
                'e.StartTime = COALESCE(?, e.StartTime), ' +
                'e.EndTime = COALESCE(?, e.EndTime), ' +
                'e.Saved = COALESCE(?, e.Saved) ' +
                'WHERE e.ID = ?;';
            const queryB = 'UPDATE ak_events e ' +
                'SET e.name = COALESCE(?, e.name), ' +
                'e.EventTypeID = COALESCE(?, e.EventTypeID), ' +
                'e.StartTime = COALESCE(?, e.StartTime), ' +
                'e.EndTime = COALESCE(?, e.EndTime), ' +
                'e.Saved = COALESCE(?, e.Saved) ' +
                'WHERE e.name = ?;';
            const queryC = 'SELECT * FROM ak_events e WHERE e.id =?';
            const queryD = 'SELECT * FROM ak_events e WHERE e.name =?';
            let queryOne = '';
            let queryTwo = '';
            const name = params.get('name') === undefined ? null : params.get('name');
            const finalID = name != null ? name : eventID;
            const eventTypeID = params.get('eventType') === undefined ? null : params.get('eventType');
            const startTime = params.get('startTime') === undefined ? null : params.get('startTime');
            const endTime = params.get('endTime') === undefined ? null : params.get('endTime');
            let saved = params.get('saved') === undefined ? null : params.get('saved');
            if (saved != null) {
                saved = (saved === 'true') ? 1 : 0;
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

    /**
     * Saves an event. Saved events should not be altered or receive new transactions.
     * Currently this is not implemented, it will be implemented in later versions of the AKA.
     * @param eventID - The ID or name of the event.
     * @param saved - Boolean as string indicating if the event needs to be saved.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    saveEvent = (eventID: string, saved: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = 'UPDATE ak_events e SET e.saved = ?, ' +
            'e.EndTime = CURRENT_TIMESTAMP WHERE e.id = ?;';
            const queryTwo = 'UPDATE ak_events e SET e.saved = ?, ' +
            'e.EndTime = CURRENT_TIMESTAMP WHERE e.name = ?;';
            const queryThree = 'SELECT * FROM ak_events e WHERE e.id = ?;';
            const queryFour = 'SELECT * FROM ak_events e WHERE e.name = ?';
            let queryToPerform = '';
            let secondQuery = '';
            const savedNum = (saved === 'true') ? 1 : 0;
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

    /**
     * Updates the price of an product in the events prices table. This assumes that
     * for the product and event there is an entry. If successful, the new price is returned.
     * @param eventID - The name or ID of the event.
     * @param productID - The name or ID of the product.
     * @param price - The new price in euro cents.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateEventPrices = (eventID: string, productID: string, price: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'UPDATE ak_eventprice et SET ' +
                'et.price = COALESCE(?, et.price) WHERE et.EventID = ? AND et.productID = ?';
            const queryB = 'UPDATE ak_eventprice et SET ' +
                'et.price = COALESCE(?, et.price) WHERE et.EventID = ' +
                '(SELECT e.id FROM ak_events WHERE e.name = ?) AND et.productID = ?;';
            const queryC = 'UPDATE ak_eventprice et SET ' +
                'et.price = COALESCE(?, et.price) WHERE et.EventID = ? AND ' +
                '(SELECT p.id FROM ak_products WHERE e.name = ?);';
            const queryD = 'UPDATE ak_eventprice et SET ' +
                'et.price = COALESCE(?, et.price) WHERE et.EventID = ' +
                '(SELECT e.id FROM ak_events WHERE e.name = ?) AND ' +
                '(SELECT p.id FROM ak_products WHERE e.name = ?);';
            const queryE = 'SELECT * FROM ak_eventprice p WHERE p.EventID = ? AND et.productID = ?';
            const queryF = 'SELECT * FROM ak_events p WHERE p.EventID = ' +
                '(SELECT e.id FROM ak_events WHERE e.name = ?) AND et.productID = ?';
            const queryG = 'SELECT * FROM ak_eventprice p WHERE p.EventID = ? AND et.productID = ' +
                '(SELECT p.id FROM ak_products WHERE e.name = ?);';
            const queryH = 'SELECT * FROM ak_events p WHERE p.EventID = ' +
                '(SELECT e.id FROM ak_events WHERE e.name = ?) AND et.productID = ' +
                '(SELECT p.id FROM ak_products WHERE e.name = ?);';
            let queryToPerform = '';
            let secondQuery = '';
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

    /**
     * Deletes an event from the database. If failed, the promise will be rejected
     * with the error.
     * @param eventID - The name or ID of the event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteEvent = (eventID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'DELETE FROM ak_events e WHERE e.id = ?';
            const queryB = 'DELETE FROM ak_events e WHERE e.name = ?';
            let query = '';
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

    /**
     * Deletes an event price for a product from the database.
     * @param eventID - The name or ID of the event.
     * @param productID - The name or ID of the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteEventPrice = (eventID: string, productID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'DELETE FROM ak_eventprice e WHERE e.EventID = ? and e.ProductID = ?';
            const queryB = 'DELETE FROM ak_eventprice e WHERE e.EventID = ' +
                '(SELECT et.id FROM ak_events et WHERE et.name = ?) and e.ProductID = ?';
            const queryC = 'DELETE FROM ak_eventprice e WHERE e.EventID = ' +
                '? and e.ProductID = (SELECT p.id FROM ak_products WHERE e.name = ?)';
            const queryD = 'DELETE FROM ak_eventprice e WHERE e.EventID = ' +
                '(SELECT et.id FROM ak_events et WHERE et.name = ?) ' +
                'and e.ProductID = (SELECT p.id FROM ak_products WHERE e.name = ?)';
            let query = '';
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
