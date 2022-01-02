import { executeTransactions } from "../database";


//
// ------------------------- Create statements -------------------------
//

/**
 * Adds the session and the login id of the user to the active sessions table.
 * @param loginID the id of the user
 * @param session the session of the user
 * @param callback the callback method with either the error or the result
 */
export const authenticateUserInDB = (loginID:number, session:string, callback: 
    (error:Error | null, result?:number) => void) => {
    const query = "INSERT INTO ak_activesessions (loginID, sessionId) " +
    "VALUES (?,?);";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [loginID,session]
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
 * Retrieves the active session information from the database based on the session.
 * @param session the session that needs to be verified.
 * @param callback the callback method containing the error or the id and expire date of the session
 */
export const verifyUserInDB = (session:string, callback: 
    (error:Error | null, loginID?:number, expires?:number) => void) => {
    const query = "SELECT a.loginID, s.expires FROM ak_activesessions a "+
	"INNER JOIN ak_session s " +
    "ON a.sessionId = s.session_id " +
    "WHERE a.sessionId = ?";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [session]
        }
    ]).then(
        val => {
            callback(null, val[1].result[0].loginID, val[1].result[0].expires)
        }).catch(
            err => callback(err)
        );
}

//
// ------------------------- Delete statements -------------------------
//

/**
 * Logs an user out of the database.
 * @param loginID The id of the user.
 * @param callback the callback method with either the error or the result
 */
export const logOutUser = (loginID:string, callback: 
    (error:Error | null, result?:string) => void) => {
    const query = "DELETE FROM ak_activesessions a WHERE a.loginID = ?;";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [loginID]
        }
    ]).then(
        val => {
            callback(null, val[1].result)
        }).catch(
            err => callback(err)
        );
}

/**
 * Logs a session out of the database.
 * @param session the session to log out.
 * @param callback the callback method with either the error or the result
 */
export const logOutSession = (session:string, callback: 
    (error:Error | null, result?:string) => void) => {
    const query = "DELETE FROM ak_activesessions a WHERE a.sessionId = ?;";

    executeTransactions([
        {
            id: 1,
            query: query,
            parameters: [session]
        }
    ]).then(
        val => {
            callback(null, val[1].result)
        }).catch(
            err => callback(err)
        );
}