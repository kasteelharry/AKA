import { RowDataPacket } from "mysql2";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";
import { UnexpectedSQLResultError } from "../../exceptions/UnexpectedSQLResultError";
import { User } from "../../model/users";
import { db } from "../database";

export const getAllUsers= (callback: Function) => {
    const query = "SELECT * FROM ak_users"

    db.query(query, (err, result) => {
        if (err) {callback(err)}
        const rows = <RowDataPacket[]> result;
        let resultArray: User[] = []
        rows.forEach(row => {
            const user: User = {
                id: row.ID,
                name: row.Name,
                dateOfBirth: row.BirthDate,
                bankAccount: row.Bankaccount,
                active: row.Active
            }
            resultArray.push(user)
        })
        callback(null, resultArray)
    })

}

export const describeUsers= (callback: Function) => {
    const query = "DESCRIBE ak_users"

    db.query(query, (err, result) => {
        if (err) {callback(err)}
        const rows = <RowDataPacket[]> result;
        rows.forEach(row => {
        })
    })
}

export const getUserByID = (userID: number, callback: Function) => {
    const query = "SELECT * FROM ak_users u WHERE u.id = ?"

    db.query(query, userID, (err, result) => {
        try {
            if (err) {callback(err)}
            const rows = <RowDataPacket[]> result;

            if (rows == undefined) {
                throw new EmptySQLResultError("No match found")
            } else if (rows.length == 1) {
                rows.forEach(row => {
                    const user: User = {
                        id: row.ID,
                        name: row.Name,
                        dateOfBirth: row.BirthDate,
                        bankAccount: row.Bankaccount,
                        active: row.Active
                    }
                    callback(null, user)
                })
            } else {
                throw new UnexpectedSQLResultError("Could not find a user with id: " + userID + ".")
            }
        } catch (error) {
            callback(error)
        }
                
    })
}

export const getUserByName = (userName: string, callback: Function) => {
    const query = "SELECT * FROM ak_users u WHERE u.name LIKE ?"
    userName = '%' + userName + '%'
    db.query(query, userName, (err, result) => {
        try {
            if (err) {callback(err)}
            const rows = <RowDataPacket[]> result;
            if (rows == undefined) {
                throw new EmptySQLResultError("No match found")
            } else if (rows.length == 1) {
                rows.forEach(row => {
                    const user: User = {
                        id: row.ID,
                        name: row.Name,
                        dateOfBirth: row.BirthDate,
                        bankAccount: row.Bankaccount,
                        active: row.Active
                    }
                    callback(null, user)
                })
            } else {
                throw new UnexpectedSQLResultError("Could not find a user with id: " + userName + ".")
            }
    } catch (error){
        callback(error)
    }
    })
}