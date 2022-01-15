import { queryType } from "@dir/app";
/**
 * This class contains all the queries that are used by the
 * API endpoints for authenticating users for the website.
 */
export default class AuthenticateQueries {

    /**
     * Constructor method that sets the database that the class will use.
     * This database can be a real one or can be a mock database for testing
     * purposes.
     * @param database - The database to use.
     */
    constructor(private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Adds the session and the login id of the user to the active sessions table.
     * @param loginID - The id of the user
     * @param session - The session of the user
     * @returns - The Promise object containing the resolved result or the rejected failure.
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
     * This method will return an error if the session or the google ID is already inside
     * the table. The Google ID is as of this version not stored somewhere else in the
     * database. In future versions this will happen such that user specific permissions
     * can be given to said user without losing their google ID and information in the database.
     * @param googleSession - the id of the user
     * @param session - the session of the user
     * @returns - The Promise object containing the resolved result or the rejected failure.
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
     * Retrieves the active session information from the database based on the session. The
     * result can be used to check if the User does indeed exist in the database and has a
     * valid session. If the results are empty then the user is not allowed to go further
     * and has to login first.
     * @param session - The session that needs to be verified.
     * @returns - The Promise object containing the resolved result or the rejected failure.
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
     * Logs an user out of the database by removing the user from the active
     * sessions table. An user that logs out will still retain their session on
     * their browser, however if they now try to login again with said token,
     * they will no longer be able to gain access to the API routes.
     *
     * @remarks
     * This will also delete any other session the user has logged into. With a
     * different session token.
     *
     * @param loginID - The ID of the user.
     * @returns - The Promise object containing the resolved result or the rejected failure.
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
     * Logs a session out of the database by deleting the entry of the session.
     * This will only log out the single session and not all the sessions associated to
     * an user.
     *
     * @remark
     * This will also log out a google login.
     *
     * @param session - The session to log out.
     * @returns - The Promise object containing the resolved result or the rejected failure.
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

