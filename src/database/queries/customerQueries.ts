import { RowDataPacket } from "mysql2";
import { db, executePreparedQuery } from "../Database";

export const getAllCustomers= (callback: Function) => {
    const query = "SELECT * FROM ak_customers";

    executePreparedQuery(query, callback);

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
    executePreparedQuery(query, callback, userID);
}