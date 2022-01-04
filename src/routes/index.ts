import express from 'express';
// import { retrieveHash } from '../database/queries/loginQueries';
import { EmailNotRegisteredError } from '../exceptions/EmailNotRegisteredError';
import bcrypt from "bcryptjs";
// import { logOutSession } from '../database/queries/authenticationQueries';
import AuthenticateQueries from '../database/queries/authenticationQueries';
import getDatabase from '../app';
import LoginQueries from '../database/queries/loginQueries';
import { UserAuthentication } from '../util/UserAuthentication';


const app = express();
const router = express.Router();
// define a route handler for the default home page
app.get('/',(req, res, next) => {
    return res.render("login");
  });

/* POST logout an user*/
app.get('/logout',(req, res, next) => {

    const authUser = new UserAuthentication(getDatabase());
    authUser.authenticateUser(req.sessionID).then(val => {
        if (val) {
            const auth = new AuthenticateQueries(getDatabase());
            auth.logOutSession(req.sessionID, (err:Error | null, result?:string) => {
                if (err) {
                    next(err);
                } else {
                    res.redirect("../");
                }
            });
        } else {
            return res.render("login");
        }
    });
  });

/* POST login an user*/
// TODO combine this with the function using the same name in the login route.
app.post('/', (req, res, next) => {
    const login = new LoginQueries(getDatabase());
    const authUser = new UserAuthentication(getDatabase());
    const email = req.body.email;
    const session = req.sessionID;
    const password: string = req.body.password;
    if (password === undefined || email === undefined) {
        return res.status(401).redirect("../");
    }
    try {
        login.retrieveHash(email, (error: Error | null, result1: string) => {
            const hash = result1;
            if (error) {
                next(error);
            } else if (hash === undefined) {
                next(new EmailNotRegisteredError("email " + email + " is not registered."));
            } else {
                bcrypt.compare(password, hash, (error2, result2) => {
                    if (result2) {
                        authUser.registerSession(session, email).then(val => {
                            // TODO change this to redirect to the dashboard.
                            res.status(200).json({ "login:": result2 });
                        }).catch(failure => {
                            next(failure);
                        });
                    } else {
                        res.status(401).json({ "login:": result2 });
                    }
                });
            }

        });
    } catch (error) {
        next(error);
    }
});
export default app;