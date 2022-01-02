import { RowDataPacket } from "mysql2";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "../../exceptions/ItemAlreadyExistsError";
import { db, executeTransactions } from "../database";

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
export const createNewCustomer = (name:string, birthDate:string | undefined, bank:string, callback: Function) => {
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
};


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
            callback(null, val[1].result);
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
        query = queryOne;
    }
    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [customerID]
        }
    ]).then(
        val => {
            callback(null, val[1].result);
        }).catch(
            err => callback(err)
        );
}

//
// ------------------------- Update statements -------------------------
//

/**
 * Updates the customer in the database based on the params input.
 * @param customerID the id or name of the customer that needs to be updated
 * @param params a map containing the values and keys that need to be updated.
 * @param callback The callback function containing either the query result or the 
 * error if one is thrown.
 */
export const updateCustomer= (customerID:string, params:Map<string, string | number | undefined>, callback:Function) => {
    const queryA = "UPDATE ak_customers c SET " + 
    "c.name = COALESCE(?,c.name), " + 
    "c.birthdate = COALESCE(?,c.birthdate), " + 
    "c.bankaccount = COALESCE(?,c.bankaccount), " + 
    "c.active = COALESCE(?,c.active) " + 
    "WHERE c.id = ?;";
    const queryB = "UPDATE ak_customers c SET c.bankaccount = ? WHERE c.name = ?;";
    const queryC = "SELECT * FROM ak_customers c WHERE c.id = ?;";
    const queryD = "SELECT * FROM ak_customers c WHERE c.name = ?;";
    let queryOne = "";
    let queryTwo = "";
    const name = params.get("name") == undefined ? null : params.get("name");
    const finalID = name != null ? name : customerID;
    const birthday = params.get("birthday") == undefined ? null : params.get("birthday") ;
    const bankaccount = params.get("bankaccount") == undefined ? null : params.get("bankaccount");
    let active = params.get("active") == undefined ? null : params.get("active");
    if (active != null) {
        active = (active =="true") ? 1 : 0;
    }
    
    const numberID = parseInt(customerID);
    if (isNaN(numberID)) {
        queryOne = queryB;
        queryTwo = queryD;
    } else {
        queryOne = queryA;
        queryTwo = queryC;
    }

    executeTransactions([
        {
            id: 1,
            query: queryOne,
            parameters: [name, birthday, bankaccount, active, customerID]
        },
        {
            id: 2,
            query: queryTwo,
            parameters: [finalID]
        }
    ]).then(
        val => {
            const queryResults = val[1].result
            if (queryResults.changedRows == 1) {
                callback(null, val[2].result);
            } else if (queryResults.affectedRows == 1) {
                callback(new ItemAlreadyExistsError());
            } else {
                callback(new EmptySQLResultError('Was unable to find a match for the id.'));
            }
            
        }).catch(
            err => callback(err)
        );
}

//
// ------------------------- Delete statements -------------------------
//

/**
 * Deletes a customer from the database.
 * @param customerID the id or name of the customer that needs to be deleted.
 * @param callback The callback function containing either the query result or the 
 * error if one is thrown.
 */
export const deleteCustomer = (customerID:string, callback:Function) => {
    const queryOne = "DELETE FROM ak_customers c WHERE c.id = ?;";
    const queryTwo = "DELETE FROM ak_customers c WHERE c.name = ?";
    let query = "";
    const numberID = parseInt(customerID);
    if (isNaN(numberID)) {
        query = queryTwo;
        customerID = '%' + customerID + '%';
    } else {
        query = queryOne;
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