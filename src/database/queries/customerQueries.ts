import { RowDataPacket } from "mysql2";
import { db, executeTransactions } from "../Database";

// 
// ------------------------- Create statements -------------------------
// 

/**
 * Creates a new customer in the database. By default this customer is active and assumes that a SEPA 
 * crediting permission is given. It returns either the result id or the error.
 * @param name the name of the customer.
 * @param birthDate the birthday of the customer.
 * @param bank the bank account of the customer. This account should be unique and not already stored
 *             in the database.
 * @param callback the callback function either containing the error or the query result.
 */
export const createNewCustomer = (name:string, birthDate:string, bank:string, callback: Function) => {
    const query = 'INSERT INTO ak_customers (Name, BirthDate, Bankaccount) ' +
    'VALUES (?, ?, ?);';

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [name, birthDate, bank]
        }
    ]).then(
        val => {
            callback(null, val[1].result.insertId)
        }).catch(
            err => callback(err)
        );
}

// 
// ------------------------- Retrieve statements -------------------------
// 

/**
 * Queries all the customers in the database, regardless if they are active or not.
 * @param callback the callback function containing either the query result or the error if
 * one is thrown.
 */
export const getAllCustomers= (callback: Function) => {
    const query = "SELECT * FROM ak_customers";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: []
        }
    ]).then(
        val => {
            callback(null, val[1].result)
        }).catch(
            err => callback(err)
        );
}

/**
 * Shows the results of the customers table.
 * @param callback The callback function containing either the query result or the 
 * error if one is thrown.
 */
export const describeCustomers= (callback: Function) => {
    const query = "DESCRIBE ak_users";

    db.query(query, (err, result) => {
        if (err) {callback(err)}
        const rows = <RowDataPacket[]> result;
        rows.forEach(row => {
        });
    });
}

/**
 * Queries a customer from the database and shows its information.
 * @param customerID the customer id whose information is being requested.
 *                   this can either be the unique customer id or their name.
 * @param callback The callback function containing either the query result or the 
 * error if one is thrown.
 */
export const getCustomerByID = (customerID: string, callback: Function) => {
    const queryOne = "SELECT * FROM ak_customers c WHERE c.id = ?";
    const queryTwo = "SELECT * FROM ak_customers c WHERE c.name LIKE ?";
    let query = "";
    const numberID = parseInt(customerID);
    if(isNaN(numberID)){
        query = queryTwo;
        customerID = '%' + customerID + '%';
    } else {
        query = queryOne
    }
    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [customerID]
        }
    ]).then(
        val => {
            callback(null, val[1].result)
        }).catch(
            err => callback(err)
        );
}

// 
// ------------------------- Update statements -------------------------
// 


// 
// ------------------------- Delete statements -------------------------
// 
