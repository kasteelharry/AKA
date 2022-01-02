import express from 'express';
import { retrieveSalt, retrieveHash } from '../database/queries/loginQueries';
import { EmailNotRegisteredError } from '../exceptions/EmailNotRegisteredError';
import { authenticateUser, registerSession } from '../util/UserAuthentication';
import bcrypt from "bcryptjs";
const app = express();
const router = express.Router();
// define a route handler for the default home page
app.get('/',(req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            return res.redirect("customers");
        } else {
            return res.render("login");
        }
    });
  });


/* POST login an user*/
// TODO combine this with the function using the same name in the login route.
app.post('/', (req, res, next) => {
    const email = req.body.email;
    const session = req.sessionID;
    const password: string = req.body.password;
    if (password === undefined || email === undefined) {
        return res.status(401).redirect("../");
    }
    try {
        retrieveHash(email, (error: Error | null, result1: string) => {
            const hash = result1;
            if (error) {
                next(error);
            } else if (hash === undefined) {
                next(new EmailNotRegisteredError("email " + email + " is not registered."));
            } else {
                bcrypt.compare(password, hash, (error2, result2) => {
                    if (result2) {
                        registerSession(session, email).then(val => {
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