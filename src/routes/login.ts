import express from 'express';
import bcrypt from "bcryptjs";
import { EmailNotRegisteredError } from '../exceptions/EmailNotRegisteredError';
import { OAuth2Client } from 'google-auth-library';

import UserAuthentication from '../util/UserAuthentication';
import getDatabase from '../app';
import LoginQueries from '../queries/LoginQueries';



const router = express.Router();
// define a route handler for the default home page
router.get('/', (req, res, next) => {
    res.render('login');
});
/* POST login an user*/
router.post('/', (req, res, next) => {
    const login = new LoginQueries(getDatabase());
    const authUser = new UserAuthentication(getDatabase());
    const email = req.body.email;
    const session = req.sessionID;
    const password: string = req.body.password;
    if (password === undefined || email === undefined) {
        return res.status(401).redirect("../");
    }
    try {
        login.retrieveHash(email).then(hash => {
            if (hash === undefined) {
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
        }).catch(error => next(error));
    } catch (error) {
        next(error);
    }
});

/* POST register an user*/
router.post('/register', (req, res, next) => {
    const authUser = new UserAuthentication(getDatabase());
    authUser.authenticateUser(req.sessionID).then(val => {
        if (val) {
            const email = req.body.email;
            const password = req.body.password;
            const login = new LoginQueries(getDatabase());
            login.retrieveSalt(email).then(salt => {
                bcrypt.hash(password, salt, (hashError, result1) => {
                    const hash = result1;
                    login.registerLogin(email, hash, salt).then(result => {
                        res.status(200).json({ "registered:": result });
                    }).catch(error => next(error));
                });
            }).catch(err => next(err));
        } else {
            return res.render("login");
        }
    }).catch(errors => next(errors));

});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT);
router.post('/google', async (req, res, next) => {
    const token = req.body.idtoken;
    const session = req.sessionID;
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (payload !== undefined) {
        const uniqueId = payload.sub;
        const authUser = new UserAuthentication(getDatabase());
        authUser.registerGoogleSession(session, uniqueId)
            .then(val => {
                res.redirect("../products");
            }).catch(err => {
                if (err === null) {
                    res.redirect("../products");
                }
                next(err);
            });
    } else {
        res.render("login");
    }
});

export default router;