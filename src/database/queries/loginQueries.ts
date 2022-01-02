import { genSalt } from "bcryptjs";
import bcrypt from "bcryptjs";
import { executeTransactions } from "../database";

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
export const registerLogin = (email:string, hash:string, salt:string, callback:Function) => {
    const query = "INSERT INTO ak_login (email, password, salt) " + 
    "VALUES (?,?,?);";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [email, hash, salt]
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
 * Retrieves the user id.
 * @param email the email of the user
 * @returns the id of the user or the error.
 */
export const retrieveUserID = (email:string): Promise<number> => {
    return new Promise((resolve, reject) => {
        const query = "SELECT l.loginID FROM ak_login l WHERE l.email = ?;";

        executeTransactions([
            {
                id: 1,
                query: query,
                parameters: [email]
            }
        ]).then(
            val => {
                resolve(val[1].result[0].loginID)
            }).catch(
                err => reject(err)
            );

    })
}

/**
 * Retrieves the salt of the user from the database.
 * @param email the email of the user.
 * @param callback The callback function containing either the query result or the 
 * error if one is thrown. 
 */
export const retrieveSalt = (email:string, callback:Function) => {
    const query = "SELECT l.salt FROM ak_login l WHERE l.email = ?";
    console.log(email);
    
    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [email]
        }
    ]).then (
        val => {
            console.log(val);
            
            console.log("value is " + val[1][1]);
            console.log("value " + val[1].result.length);
            
            if (val[1].result.length == 0) {
                bcrypt.genSalt((err, salt) => {
                    // console.log(salt);
                    
                    callback(null, salt)
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
export const retrieveHash = (email: string, callback: Function) => {
    const query = "SELECT l.password FROM ak_login l WHERE l.email = ?";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [email]
        }
    ]).then (
        val => {
            callback(null, val[1].result[0].password);
        }
    ).catch(err => callback(err));
}