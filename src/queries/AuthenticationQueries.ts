import { queryType } from "@dir/app";
export default class AuthenticateQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Adds the session and the login id of the user to the active sessions table.
     * @param loginID the id of the user
     * @param session the session of the user
     * @param callback the callback method with either the error or the result
     */
    authenticateUserInDB = (loginID: number, session: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const qry = "INSERT INTO ak_activesessions (loginID, sessionId) " +
                "VALUES (?,?);";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: qry,
                    parameters: [loginID, session]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        const msg: string = err.message;
                        if (msg.match("Duplicate")) {
                            resolve(0);
                        } else {
                            reject(err);
                        }
                    }
                );
        });
    }

    /**
     * Adds the session and the google id of the user to the active google sessions table.
     * @param googleSession the id of the user
     * @param session the session of the user
     * @param callback the callback method with either the error or the result
     */
    authenticateGUserInDB = (googleSession: string, session: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const qry = "INSERT INTO ak_googleSessions (googleSession, sessionId) " +
                "VALUES (?,?);";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: qry,
                    parameters: [googleSession, session]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        const msg: string = err.message;
                        if (msg.match("Duplicate")) {
                            resolve(0);
                        } else {
                            reject(err);
                        }
                    }
                );
        });
    }

    //
    // ------------------------- Retrieve statements -------------------------
    //

    /**
     * Retrieves the active session information from the database based on the session.
     * @param session the session that needs to be verified.
     * @param callback the callback method containing the error or the (google) id and expire date of the session
     */
    verifyUserInDB = (session: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            // const queryToPerform = "SELECT a.loginID, s.expires FROM ak_activesessions a "+
            // "INNER JOIN ak_session s " +
            // "ON a.sessionId = s.session_id " +
            // "WHERE a.sessionId = ?";
            const queryToPerform = "SELECT * FROM ak_activesessions a "
                + "RIGHT JOIN ak_session s "
                + "ON a.sessionId = s.session_id "
                + "LEFT JOIN ak_googleSessions g "
                + "ON s.session_id = g.sessionId "
                + "WHERE g.sessionId = ? OR a.sessionId = ?";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [session, session]
                }
            ]).then(
                val => {
                    const table = val[1].result[0];
                    let login;
                    let expire;
                    let google;
                    if (table !== undefined) {
                        login = table.loginID;
                        expire = table.expires;
                        google = table.googleId;
                    }
                    resolve([login, expire, google]);
                }).catch(
                    err => reject(err)
                );
        });
    }

    //
    // ------------------------- Delete statements -------------------------
    //

    /**
     * Logs an user out of the database.
     * @param loginID The id of the user.
     * @param callback the callback method with either the error or the result
     */
    logOutUser = (loginID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const qry = "DELETE FROM ak_activesessions a WHERE a.loginID = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: qry,
                    parameters: [loginID]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                    err => reject(err)
                );
        });
    }

    /**
     * Logs a session out of the database.
     * @param session the session to log out.
     * @param callback the callback method with either the error or the result
     */
    logOutSession = (session: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const qry = "DELETE FROM ak_activesessions a WHERE a.sessionId = ?;";
            const qry2 = "DELETE FROM ak_googlesessions g WHERE g.sessionID = ?;";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: qry,
                    parameters: [session]
                },
                {
                    id: 2,
                    query: qry2,
                    parameters: [session]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                    err => reject(err)
                );
        });
    }
}

