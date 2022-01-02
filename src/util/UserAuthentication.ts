import { retrieveUserID } from "../database/queries/loginQueries";
import { authenticateUserInDB, logOutSession, verifyUserInDB } from "../database/queries/authenticationQueries";

/**
 * Authenticates a session.
 * @param session the session to authenticate.
 * @returns true if the user is authenticated, false if not.
 */
export async function authenticateUser(session:string): Promise<boolean> {
    return new Promise((resolve) => {
    verifyUserInDB(session, (error, loginID, expires) => {
        if (error) {
            resolve(false);
        } else {
            if (loginID === undefined || expires === undefined) {
                return;
            } else {
                const expiresMilliseconds = expires * 1000;
                if (expiresMilliseconds > new Date().getTime()) {
                    resolve(true);
                } else {
                    logOutSession(session, (err, result) => {
                        if (err) {
                            resolve(false);
                        }
                    });
                }
            }
            resolve(false);
        }
    });
    });
}

/**
 * Authenticates an user with a valid session such that the other endpoints can be queried.
 * @param session the session to register
 * @param email the email of the user that needs to be registered.
 * @returns true if the authentication process has been completed, false if not.
 */
export function registerSession(session:string, email:string): Promise<boolean> {
    return new Promise((resolve) => {
        retrieveUserID(email).then((result) => {
            authenticateUserInDB(result, session, (err, res) => {
                if (err) {
                    resolve(false);
                }
                if (res !== undefined && res > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        }).catch((err) => {
            resolve(false);
        });
    });
}
