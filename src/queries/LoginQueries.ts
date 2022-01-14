import { genSalt } from "bcryptjs";
import bcrypt from "bcryptjs";

import { queryType } from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
export default class LoginQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }
    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Registers user into the database
     * @param email - The email of the user.
     * @param hash - The hashed password.
     * @param salt - The salt used when hashing.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    registerLogin = (email: string, hash: string, salt: string): Promise<number> => {
        return new Promise((resolve, reject) => {
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
                resolve(val[1].result.insertId);
            }).catch(
                err => reject(err)
            );
        });
    }

    //
    // ------------------------- Retrieve statements -------------------------
    //
    /**
     * Retrieves the user id from the database based on the email.
     * @param email - The email of the user
     * @returns - The Promise object containing the resolved result or the rejected failure.
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
                    const res =val[1].result[0];
                    if (res === undefined || res.length === 0) {
                        reject(new EmptySQLResultError("Could not find: " + email));
                    }
                    resolve(res.loginID);
                }).catch(
                    err => reject(err)
                );

        });
    }

    /**
     * Retrieves the salt of the user from the database.
     * @param email - The email of the user.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    retrieveSalt = (email: string): Promise<any> => {
        return new Promise((resolve, reject) => {
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
                        resolve(salt);
                    });
                } else {
                    resolve(val[1].result[0].salt);
                }
            }
        ).catch(err => {
            genSalt().then(salt => resolve(salt));
        });
    });
}

    /**
     * Retrieves the user hash from the database.
     * @param email - The email of the user
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    retrieveHash = (email: string): Promise<any> => {
        return new Promise((resolve, reject) => {
        const qry = "SELECT l.password FROM ak_login l WHERE l.email = ?";

        this.database.executeTransactions([
            {
                id: 1,
                query: qry,
                parameters: [email]
            }
        ]).then(
            val => {
                resolve(val[1].result[0].password);
            }
        ).catch(err => reject(err));
    });
}
}
