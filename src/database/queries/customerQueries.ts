import { RowDataPacket } from "mysql2";
import { db, executeTransactions } from "../Database";

// 
// ------------------------- Create statements -------------------------
// 


// 
// ------------------------- Retrieve statements -------------------------
// 

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

export const describeCustomers= (callback: Function) => {
    const query = "DESCRIBE ak_users";

    db.query(query, (err, result) => {
        if (err) {callback(err)}
        const rows = <RowDataPacket[]> result;
        rows.forEach(row => {
        });
    });
}

export const getCustomerByID = (userID: string, callback: Function) => {
    const queryOne = "SELECT * FROM ak_customers c WHERE c.id = ?";
    const queryTwo = "SELECT * FROM ak_customers c WHERE c.name LIKE ?";
    let query = "";
    const numberID = parseInt(userID);
    if(isNaN(numberID)){
        query = queryTwo;
        userID = '%' + userID + '%';
    } else {
        query = queryOne
    }
    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [userID]
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