import { queryType } from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import { convertStringToSQLDate } from "@dir/util/ConvertStringToSQLDate";


export default class SalesQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Creates a new entry in the sales column, the sale is not associated to any person or
     * group. Therefore this method should not be used when the sale is done by any person
     * or group.
     * @param eventID - The ID of the event.
     * @param productID - The ID of the product.
     * @param amount - The amount of the product that was sold.
     * @param timestamp - The timestamp of the transaction in milliseconds.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createSale = (eventID: number, productID: number, amount: number, timestamp?: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (timestamp === undefined) {
                timestamp = convertStringToSQLDate((new Date()).toISOString());
            }
            const query = "INSERT INTO ak_sales (EventID, ProductID, amount, TimeSold) "
                + "VALUES(?,?,?,?);";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [eventID, productID, amount, timestamp]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Given transaction already exists."));
                        } else {
                            reject(err);
                        }
                    }
                );
        });
    }

    /**
     * Creates a new entry for sales that is associated to a customer. The total price is calculated based on the amount
     * and the unit price for the product during the event. This is for a singular product and should not be called for
     * a sale where different products are sold in succession. If multiple types of products are sold, {@link createCombinedCustomerSale}
     * should be called.
     * @param customerID - The ID of the customer.
     * @param eventID - The ID of the event.
     * @param productID - The ID of the product.
     * @param amount - The amount of the product that was sold.
     * @param timestamp - The timestamp of the transaction in milliseconds.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createCustomerSale = (customerID: number, eventID: number, productID: number, amount: number, timestamp?: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            if (timestamp === undefined) {
                timestamp = convertStringToSQLDate((new Date()).toISOString());
            }
            const createSale = "INSERT INTO ak_sales (EventID, ProductID, amount, TimeSold) "
                + "VALUES(?,?,?,?);";
            const query = "INSERT INTO ak_usersales (TimeSold, UserID, totalPrice)"
                + "VALUES(?,?,((SELECT CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID)"
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
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
                + "WHERE e.ID = ? AND ep.ProductID = ?))*?);";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: createSale,
                    parameters: [eventID, productID, amount, timestamp]
                },
                {
                    id: 2,
                    query,
                    parameters: [timestamp, customerID, eventID, productID, amount]
                },
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Given transaction already exists."));
                        } else {
                            reject(err);
                        }
                    }
                );
        });
    }

    /**
     * Creates new entries for the transaction that has multiple different products that were
     * sold. By calling this method, the transactions are handled in a single commit and thus
     * if anything goes wrong the entire transaction is rolled back.
     * @param customerID - The ID of the customer.
     * @param eventID - The ID of the event where the transaction was made.
     * @param products - An array containing an object which contains each product
     * that was sold, the amount and (optional) the Timestamp.
     * In it is in the following form.
     * ```typescript
     * [
     *     {
     *          productID:number,
     *          amount:number,
     *          timestamp?:string
     *     }
     * ]
     * ```
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createCombinedCustomerSale = (customerID: number, eventID: number, products: { productID: number, amount: number, timestamp?: string }[]): Promise<any> => {
        return new Promise((resolve, reject) => {
            const createSale = "INSERT INTO ak_sales (EventID, ProductID, amount, TimeSold) "
                + "VALUES(?,?,?,?);";
            const query = "INSERT INTO ak_usersales (TimeSold, UserID, totalPrice)"
                + "VALUES(?,?,((SELECT CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID)"
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
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
                + "WHERE e.ID = ? AND ep.ProductID = ?))*?);";
            const queries = [];
            let index = 0;
            for (const qry of products) {
                if (qry.timestamp === undefined) {
                    qry.timestamp = convertStringToSQLDate((new Date()).toISOString());
                }
                queries.push(
                    {
                        id: index + 1,
                        query: createSale,
                        parameters: [eventID, qry.productID, qry.amount, qry.timestamp]
                    });
                queries.push({
                    id: index + 2,
                    query,
                    parameters: [qry.timestamp, customerID, eventID, qry.productID, qry.amount]
                },
                );
                index += 2;
            }
            this.database.executeTransactions(queries).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Given transaction already exists."));
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
     * Retrieves all the sales from the database, regardless of event or customer.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllSales = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
                + "ps.price as UnitPrice, s.amount, "
                + "(ps.price * amount) as TotalPrice FROM ak_sales s "
                + "LEFT JOIN ak_products p "
                + "ON p.ID = s.ProductID "
                + "LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID) ps "
                + "ON ps.ID = s.EventID "
                + "AND p.ID = ps.ProductID;";
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
     * Retrieves all the transactions based on a single event.
     * @param eventID - The ID of the event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllSalesEvent = (eventID: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
                + "ps.price as UnitPrice, s.amount, "
                + "(ps.price * amount) as TotalPrice FROM ak_sales s "
                + "LEFT JOIN ak_products p "
                + "ON p.ID = s.ProductID "
                + "LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID) ps "
                + "ON ps.ID = s.EventID "
                + "AND p.ID = ps.ProductID "
                + "WHERE s.EventID = ?";
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
     * Retrieves all the sales of a single customer, regardless of event.
     * @param userID - The ID of the customer.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllSalesByUser = (userID: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
                + "ps.price as UnitPrice, s.amount, "
                + "(ps.price * amount) as TotalPrice FROM ak_sales s "
                + "LEFT JOIN ak_products p "
                + "ON p.ID = s.ProductID "
                + "LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID) ps "
                + "ON ps.ID = s.EventID "
                + "AND p.ID = ps.ProductID "
                + "LEFT JOIN ak_usersales us "
                + "ON us.TimeSold = s.TimeSold "
                + "WHERE us.UserID = ?";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [userID]
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
     * Retrieves all the sales made by a single customer during a certain event.
     * @param userID - The ID of the customer.
     * @param eventID - The ID of the event.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllSalesByUserAndEvent = (userID: number, eventID: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
                + "ps.price as UnitPrice, s.amount, "
                + "(ps.price * amount) as TotalPrice FROM ak_sales s "
                + "LEFT JOIN ak_products p "
                + "ON p.ID = s.ProductID "
                + "LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID) ps "
                + "ON ps.ID = s.EventID "
                + "AND p.ID = ps.ProductID "
                + "LEFT JOIN ak_usersales us "
                + "ON us.TimeSold = s.TimeSold "
                + "WHERE us.UserID = ? "
                + "AMD s.EventID = ?";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [userID, eventID]
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
     * Retrieves a transaction based on the timestamp.
     * @param timestamp - The timestamp of when the transaction had occurred.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getSaleByTimeStamp = (timestamp: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
                + "ps.price as UnitPrice, s.amount, "
                + "(ps.price * amount) as TotalPrice FROM ak_sales s "
                + "LEFT JOIN ak_products p "
                + "ON p.ID = s.ProductID "
                + "LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID) ps "
                + "ON ps.ID = s.EventID "
                + "AND p.ID = ps.ProductID "
                + "LEFT JOIN ak_usersales us "
                + "ON us.TimeSold = s.TimeSold "
                + "WHERE s.TimeSold = ?";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [timestamp]
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
     * Retrieves all the transactions between two timestamps from the database.
     * @param lowerBoundTimeStamp - The lower bound timestamp in milliseconds.
     * @param upperBoundTimeStamp - the upper bound timestamp in milliseconds
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getSaleByTimeStampInterval = (lowerBoundTimeStamp: string, upperBoundTimeStamp: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
                + "ps.price as UnitPrice, s.amount, "
                + "(ps.price * amount) as TotalPrice FROM ak_sales s "
                + "LEFT JOIN ak_products p "
                + "ON p.ID = s.ProductID "
                + "LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
                + "WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
                + "THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
                + "FROM ak_events e "
                + "LEFT JOIN ak_eventTypePrice ep "
                + "ON e.EventTypeID=ep.EventTypeID "
                + "LEFT JOIN ak_eventPrice eps "
                + "ON eps.EventID = e.ID "
                + "AND eps.ProductID = ep.ProductID "
                + "LEFT JOIN ak_products p "
                + "ON ep.ProductID = p.ID) ps "
                + "ON ps.ID = s.EventID "
                + "AND p.ID = ps.ProductID "
                + "LEFT JOIN ak_usersales us "
                + "ON us.TimeSold = s.TimeSold "
                + "WHERE s.TimeSold BETWEEN ? AND ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [lowerBoundTimeStamp, upperBoundTimeStamp]
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
     * Updates the information of an event. It does not propagate the change to the customer sales table.
     * If the amount or the product is updated, the customer sales table should be updated manually.
     *
     * @remark
     * Called in combination with {@link updateUserSale} will ensure that all the necessary information
     * is updated accordingly. The new price should be determined/calculated by the method calling this
     * function.
     *
     * @param timestamp - The timestamp of the transaction to update.
     * @param eventID - The new event the transaction should be associated with
     * @param productID - The new product that was sold
     * @param amount - The new amount that was sold.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateSale = (timestamp: string, eventID?: number, productID?: number, amount?: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "UPDATE ak_sales s SET s.EventID = COALESCE(?, s.EventID), "
                + "s.ProductID = COALESCE(?,s.ProductID), s.amount = (?, s.amount) "
                + "WHERE s.TimeSold = ?";
            const secondQuery = "SELECT * FROM ak_sales s WHERE s.TimeSold = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [timestamp, eventID, productID, amount]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [timestamp]
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
     * Updates the customer information or the total price of a transaction. This does not
     * update the transaction information. That should be changed manually.
     *
     * @remark
     * Called in combination with {@link updateSale} will ensure that all the necessary information
     * is updated accordingly. The new price should be determined/calculated by the method calling this
     * function.
     *
     * @param timestamp - The timestamp of the transaction to update.
     * @param customerID - The new customer ID that will be associated with the the transaction
     * @param totalPrice - The new total price of the transactions.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateUserSale = (timestamp: string, customerID?: number, totalPrice?: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "UPDATE ak_usersales s SET s.UserID = COALESCE(?, s.UserID), "
                + "s.TotalPrice = COALESCE(?, s.TotalPrice)"
                + "WHERE s.TimeSold = ?";
            const secondQuery = "SELECT * FROM ak_usersales s WHERE s.TimeSold = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [timestamp, customerID, totalPrice]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [timestamp]
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

    updateSalesAndUsers = (timestamp:string, eventID?: number, customerID?:number, productID?: number, amount?: number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = "UPDATE ak_sales s SET s.EventID = COALESCE(?, s.EventID), "
            + "s.ProductID = COALESCE(?,s.ProductID), s.amount = (?, s.amount) "
            + "WHERE s.TimeSold = ?";
            const queryB = "UPDATE ak_usersales s SET s.UserID = COALESCE(?, s.UserID), "
            +"s.TotalPrice = COALESCE(((SELECT CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e  "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID "
            +"INNER JOIN ak_eventTypes et "
            +"ON e.EventTypeID = et.ID "
            +"WHERE e.ID = COALESCE(?, (SELECT sale.EventID FROM ak_sales sale WHERE sale.TimeSold = ?)) "
            +"AND ep.ProductID = COALESCE(?, (SELECT sale.ProductID FROM ak_sales sale WHERE sale.TimeSold = ?))) "
            +"* COALESCE(?, (SELECT sale.amount FROM ak_sales sale WHERE sale.TimeSold = ?))), s.TotalPrice) "
            +"WHERE s.TimeSold = ?";
            const secondQuery = "SELECT * FROM ak_usersales s WHERE s.TimeSold = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryA,
                    parameters: [eventID, productID, amount, timestamp]
                },
                {
                    id: 2,
                    query: queryB,
                    parameters: [customerID, eventID, timestamp, productID, timestamp, amount, timestamp, timestamp]
                },
                {
                    id: 3,
                    query: secondQuery,
                    parameters: [timestamp]
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
     * Deletes a transaction from the database.
     * @param timestamp - The timestamp of the transaction to delete.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteSale = (timestamp: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM ak_sales s WHERE s.timestamp = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [timestamp]
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
     * Deletes the linking between a transaction and a customer. It does not delete
     * the transaction from the database.
     * @param timestamp - The timestamp of the transaction to delete.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteUserSale = (timestamp: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM ak_usersales s WHERE s.timestamp = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [timestamp]
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