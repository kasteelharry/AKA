import express from 'express';
import { EmailNotRegisteredError } from '@dir/exceptions/EmailNotRegisteredError';
import bcrypt from 'bcryptjs';
import AuthenticateQueries from '@dir/queries/AuthenticationQueries';
import getDatabase from '@dir/app';
import LoginQueries from '@dir/queries/LoginQueries';
import UserAuthentication from '@dir/util/UserAuthentication';

const app = express();
// const router = express.Router();
// define a route handler for the default home page
app.get('/', (req, res, next) => {
    return res.render('login');
});

/* POST logout an user */
app.get('/logout', (req, res, next) => {
    const authUser = new UserAuthentication(getDatabase());
    authUser.authenticateUser(req.sessionID).then(val => {
        if (val) {
            const auth = new AuthenticateQueries(getDatabase());
            auth.logOutSession(req.sessionID).then(value => res.redirect('../')).catch(err => next(err));
        } else {
            return res.render('login');
        }
    });
});

/* POST login an user */
// TODO combine this with the function using the same name in the login route.
app.post('/', (req, res, next) => {
    const login = new LoginQueries(getDatabase());
    const authUser = new UserAuthentication(getDatabase());
    const email = req.body.email;
    const session = req.sessionID;
    const password: string = req.body.password;
    if (password === undefined || email === undefined) {
        return res.status(401).redirect('../');
    }
    try {
        login.retrieveHash(email).then(hash => {
            if (hash === undefined) {
                next(new EmailNotRegisteredError('email ' + email + ' is not registered.'));
            } else {
                bcrypt.compare(password, hash, (error2, result2) => {
                    if (result2) {
                        authUser.registerSession(session, email).then(val => {
                            // TODO change this to redirect to the dashboard.
                            res.status(200).json({ 'login:': result2 });
                        }).catch(failure => {
                            next(failure);
                        });
                    } else {
                        res.status(401).json({ 'login:': result2 });
                    }
                });
            }
        }).catch(error => next(error));
    } catch (error) {
        next(error);
    }
});
export default app;
