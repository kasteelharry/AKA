import { genSalt } from "bcryptjs";
import bcrypt from "bcryptjs";

import { queryType } from "../../app";
export default class LoginQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }
    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Registers user into the database
     * @param email the email of the user.
     * @param hash the hashed password.
     * @param salt the salt used when hashing.
     * @param callback The callback function containing either the query result or the
     * error if one is thrown.
     */
    registerLogin = (email: string, hash: string, salt: string, callback:
        (error: Error | null, result?: any) => void) => {
        const qry = "INSERT INTO ak_login (email, password, salt) " +
            "VALUES (?,?,?);";

            this.database.executeTransactions([
            {
                id: 1,
                query: qry,
                parameters: [email, hash, salt]
            }
        ]).then(
            val => {
                callback(null, val[1].result.insertId);
            }).catch(
                err => callback(err)
            );
    }

    //
    // ------------------------- Retrieve statements -------------------------
    //
    /**
     * Retrieves the user id.
     * @param email the email of the user
     * @returns the id of the user or the error.
     */
    retrieveUserID = (email: string): Promise<number> => {
        return new Promise((resolve, reject) => {
            const qry = "SELECT l.loginID FROM ak_login l WHERE l.email = ?;";

            this.database.executeTransactions([
                {
                    id: 1,
                    query: qry,
                    parameters: [email]
                }
            ]).then(
                val => {
                    resolve(val[1].result[0].loginID);
                }).catch(
                    err => reject(err)
                );

        });
    }

    /**
     * Retrieves the salt of the user from the database.
     * @param email the email of the user.
     * @param callback The callback function containing either the query result or the
     * error if one is thrown.
     */
    retrieveSalt = (email: string, callback:
        (error: Error | null, result?: any) => void) => {
        const qry = "SELECT l.salt FROM ak_login l WHERE l.email = ?";
        this.database.executeTransactions([
            {
                id: 1,
                query: qry,
                parameters: [email]
            }
        ]).then(
            val => {
                if (val[1].result.length === 0) {
                    bcrypt.genSalt((err, salt) => {
                        callback(null, salt);
                    });
                } else {
                    callback(null, val[1].result[0].salt);
                }
            }
        ).catch(err => {
            genSalt().then(salt => callback(null, salt));
        });
    }

    /**
     * Retrieves the user hash from the database.
     * @param email the email of the user
     * @param callback The callback function containing the result or the error
     */
    retrieveHash = (email: string, callback:
        (error: Error | null, result?: any) => void) => {
        const qry = "SELECT l.password FROM ak_login l WHERE l.email = ?";

        this.database.executeTransactions([
            {
                id: 1,
                query: qry,
                parameters: [email]
            }
        ]).then(
            val => {
                callback(null, val[1].result[0].password);
            }
        ).catch(err => callback(err));
    }
}