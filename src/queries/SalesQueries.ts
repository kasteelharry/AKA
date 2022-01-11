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
                    query:createSale,
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


    //
    // ------------------------- Retrieve statements -------------------------
    //

    getAllSales = ():Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
            +"ps.price as UnitPrice, s.amount, "
            +"(ps.price * amount) as TotalPrice FROM ak_sales s "
            +"LEFT JOIN ak_products p "
            +"ON p.ID = s.ProductID "
            +"LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID) ps "
            +"ON ps.ID = s.EventID "
            +"AND p.ID = ps.ProductID;";
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
    getAllSalesEvent = (eventID:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
            +"ps.price as UnitPrice, s.amount, "
            +"(ps.price * amount) as TotalPrice FROM ak_sales s "
            +"LEFT JOIN ak_products p "
            +"ON p.ID = s.ProductID "
            +"LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID) ps "
            +"ON ps.ID = s.EventID "
            +"AND p.ID = ps.ProductID "
            +"WHERE s.EventID = ?";
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
    getAllSalesByUser = (userID:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
            +"ps.price as UnitPrice, s.amount, "
            +"(ps.price * amount) as TotalPrice FROM ak_sales s "
            +"LEFT JOIN ak_products p "
            +"ON p.ID = s.ProductID "
            +"LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID) ps "
            +"ON ps.ID = s.EventID "
            +"AND p.ID = ps.ProductID "
            +"LEFT JOIN ak_usersales us "
            +"ON us.TimeSold = s.TimeSold "
            +"WHERE us.UserID = ?";
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

    getAllSalesByUserAndEvent = (userID:number, eventID:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
            +"ps.price as UnitPrice, s.amount, "
            +"(ps.price * amount) as TotalPrice FROM ak_sales s "
            +"LEFT JOIN ak_products p "
            +"ON p.ID = s.ProductID "
            +"LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID) ps "
            +"ON ps.ID = s.EventID "
            +"AND p.ID = ps.ProductID "
            +"LEFT JOIN ak_usersales us "
            +"ON us.TimeSold = s.TimeSold "
            +"WHERE us.UserID = ? "
            +"AMD s.EventID = ?";
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


    getSaleByTimeStamp = (timestamp:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
            +"ps.price as UnitPrice, s.amount, "
            +"(ps.price * amount) as TotalPrice FROM ak_sales s "
            +"LEFT JOIN ak_products p "
            +"ON p.ID = s.ProductID "
            +"LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID) ps "
            +"ON ps.ID = s.EventID "
            +"AND p.ID = ps.ProductID "
            +"LEFT JOIN ak_usersales us "
            +"ON us.TimeSold = s.TimeSold "
            +"WHERE s.TimeSold = ?";
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

    getSaleByTimeStampInterval = (timestampOne:string, timestampTwo:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT s.TimeSold, s.EventID, s.ProductID, p.Name, "
            +"ps.price as UnitPrice, s.amount, "
            +"(ps.price * amount) as TotalPrice FROM ak_sales s "
            +"LEFT JOIN ak_products p "
            +"ON p.ID = s.ProductID "
            +"LEFT JOIN (SELECT e.ID, ep.ProductID, CASE WHEN EXISTS(SELECT * "
            +"WHERE eps.EventID = e.ID AND eps.ProductID = ep.ProductID) "
            +"THEN eps.UnitPrice ELSE ep.UnitPrice END AS price "
            +"FROM ak_events e "
            +"LEFT JOIN ak_eventTypePrice ep "
            +"ON e.EventTypeID=ep.EventTypeID "
            +"LEFT JOIN ak_eventPrice eps "
            +"ON eps.EventID = e.ID "
            +"AND eps.ProductID = ep.ProductID "
            +"LEFT JOIN ak_products p "
            +"ON ep.ProductID = p.ID) ps "
            +"ON ps.ID = s.EventID "
            +"AND p.ID = ps.ProductID "
            +"LEFT JOIN ak_usersales us "
            +"ON us.TimeSold = s.TimeSold "
            +"WHERE s.TimeSold BETWEEN ? AND ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [timestampOne, timestampTwo]
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

    updateSale = (timestamp:string, eventID?:number, productID?:number, amount?:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "UPDATE ak_sales s SET s.EventID = COALESCE(?, s.EventID), "
            +"s.ProductID = COALESCE(?,s.ProductID), s.amount = (?, s.amount) "
            +"WHERE s.TimeSold = ?";
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

    updateUserSale = (timestamp:string, customerID?:number, totalPrice?:number):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "UPDATE ak_usersales s SET s.CustomerID = COALESCE(?, s.CustomerID), "
            +"s.TotalPrice = COALESCE(?, s.TotalPrice)"
            +"WHERE s.TimeSold = ?";
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

    //
    // ------------------------- Delete statements -------------------------
    //

    deleteSale = (timestamp:string):Promise<any> => {
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

    deleteUserSale = (timestamp:string):Promise<any> => {
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