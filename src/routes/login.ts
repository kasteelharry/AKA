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
    let password: string = req.body.password;
    if (password == undefined || email == undefined) {
        return res.status(401).redirect("../");
    }
    let salt: string = '';
    try {
        retrieveSalt(email, (err: Error, result: string) => {
            // console.log(result);

            salt = result;
            console.log(salt);
            let hash = '';
            retrieveHash(email, (err: Error, result: string) => {
                hash = result;
                console.log(hash);

                if (err) {
                    next(err);
                } else if (hash == undefined) {
                    next(new EmailNotRegisteredError("email " + email + " is not registered."))
                } else {
                    bcrypt.compare(password, hash, (err, result) => {
                        if (result) {
                            registerSession(session, email).then(val => {
                                res.status(200).json({ "login:": result });
                            });
                        } else {
                            res.status(401).json({ "login:": result })
                        }
                    });
                }

            });

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
            let password = req.body.password;
            retrieveSalt(email, (err: Error, result: string) => {
                if (err) {
                    next(err);
                }
                const salt = result;
                bcrypt.hash(password, salt, (err, result) => {
                    const hash = result;
                    console.log(hash);

                    registerLogin(email, result, salt, (err: Error, result: string) => {
                        if (err) {
                            next(err);
                        } else {
                            res.status(200).json({ "registered:": result })
                        }
                    });
                })
            });
        } else {
            return res.render("login");
        }
    });

});

export default router;