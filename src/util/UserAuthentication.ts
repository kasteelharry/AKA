// import { retrieveUserID } from "../database/queries/loginQueries";

import AuthenticateQueries from '../queries/AuthenticationQueries';
import { queryType } from '../app';
import LoginQueries from '../queries/LoginQueries';

export default class UserAuthentication {

    private auth: AuthenticateQueries;
    private login: LoginQueries;

    constructor(private database: Database<queryType>) {
        this.database = database;
        this.auth = new AuthenticateQueries(this.database);
        this.login = new LoginQueries(this.database);
    }
    /**
     * Authenticates a session.
     * @param session the session to authenticate.
     * @returns true if the user is authenticated, false if not.
     */
    authenticateUser(session: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            this.auth.verifyUserInDB(session).then(result => {
                const loginID = result[0];
                const expires = result[1];
                if (loginID === undefined || expires === undefined) {
                    resolve(false);
                } else {
                    const expiresMilliseconds = expires * 1000;
                    if (expiresMilliseconds > new Date().getTime()) {
                        resolve(true);
                    } else {
                        this.auth.logOutSession(session)
                        .then(() => resolve(false))
                        .catch(() => resolve(false));
                    }
                }
            }).catch(() => {
                resolve(false);
            });
        });
    }

    /**
     * Authenticates an user with a valid session such that the other endpoints can be queried.
     * @param session the session to register
     * @param email the email of the user that needs to be registered.
     * @returns true if the authentication process has been completed, false if not.
     */
    registerSession(session: string, email: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.login.retrieveUserID(email).then(result => {
                if (result === undefined) {
                    resolve(false);
                }
                this.auth.authenticateUserInDB(result, session).then(res => {
                    if (res !== undefined && res > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).catch(err => reject(err));
            }).catch(err => {
                reject(err);
            });
        });
    }


    /**
     * Authenticates an user with a valid session such that the other endpoints can be queried.
     * @param session the session to register
     * @param email the email of the user that needs to be registered.
     * @returns true if the authentication process has been completed, false if not.
     */
    registerGoogleSession(session: string, googleID: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const auth = new AuthenticateQueries(this.database);
            auth.authenticateGUserInDB(googleID, session).then(res => {
                if (res !== undefined && res > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch(err => reject(err));
        });
    }
}

