import express from 'express';
import bcrypt from "bcryptjs";
import { registerLogin, retrieveHash, retrieveSalt } from '../database/queries/loginQueries';
import { EmailNotRegisteredError } from '../exceptions/EmailNotRegisteredError';
import { authenticateUser, registerSession } from '../util/UserAuthentication';

const router = express.Router();
// define a route handler for the default home page
router.get('/', (req, res, next) => {
    res.render('login');
});
/* POST login an user*/
router.post('/', (req, res, next) => {
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

/* POST register an user*/
router.post('/register', (req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            const email = req.body.email;
            const password = req.body.password;
            retrieveSalt(email, (err: Error | null, result: string) => {
                if (err) {
                    next(err);
                }
                const salt = result;
                bcrypt.hash(password, salt, (error, result1) => {
                    const hash = result1;
                    registerLogin(email, hash, salt, (error2: Error | null, result2: string) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).json({ "registered:": result2});
                        }
                    });
                });
            });
        } else {
            return res.render("login");
        }
    });

});

export default router;