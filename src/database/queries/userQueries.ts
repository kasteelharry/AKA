import { RowDataPacket } from "mysql2";
import { db, executePreparedQuery } from "../Database";

export const getAllUsers= (callback: Function) => {
    const query = "SELECT * FROM ak_users";

    executePreparedQuery(query, callback);

}

export const describeUsers= (callback: Function) => {
    const query = "DESCRIBE ak_users";

    db.query(query, (err, result) => {
        if (err) {callback(err)}
        const rows = <RowDataPacket[]> result;
        rows.forEach(row => {
        });
    });
}

export const getUserByID = (userID: string, callback: Function) => {
    const queryOne = "SELECT * FROM ak_users u WHERE u.id = ?";
    const queryTwo = "SELECT * FROM ak_users u WHERE u.name LIKE ?";
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