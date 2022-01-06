import AuthenticateQueries from '../database/queries/authenticationQueries';
import getDatabase, { queryType } from '../app';
import LoginQueries from '../database/queries/loginQueries';

export class UserAuthentication {

    private auth : AuthenticateQueries;
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
            this.auth.verifyUserInDB(session, (error, loginID, expires) => {
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
                            this.auth.logOutSession(session, (err, result) => {
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
    registerSession(session: string, email: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.login.retrieveUserID(email).then((result) => {
                this.auth.authenticateUserInDB(result, session, (err, res) => {
                    if (err) {
                        reject(err);
                    }
                    if (res !== undefined && res > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            }).catch((err) => {
                resolve(err);
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
            const auth = new AuthenticateQueries(await getDatabase());
            auth.authenticateGUserInDB(googleID, session, (err, res) => {
                if (err) {
                    reject(err);
                }
                if (res !== undefined && res > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}