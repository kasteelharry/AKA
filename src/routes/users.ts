import express from 'express'
import { User } from '../model/Users'
import {describeUsers, getAllUsers, getUserByID} from '../database/queries/UserQueries'

const router = express.Router();
/* GET users listing. */
router.get('/', (req, res, next) => {
    getAllUsers((err: Error, users: User[]) => {
        if (err) {
          next(err);
        }
        else {
            console.log(users);
            res.status(200).json({"users:": users});
        }
    });
});

/* GET user by user id listing. */
router.get('/:userId', (req, res, next) => {
    const userID = parseInt(req.params.userId);
    console.log(req.params.userId);
    console.log(userID);
    
    try {
        getUserByID(req.params.userId, (err: Error, user: User) => {
            if (err) {
                next(err);
            }
            else {
                console.log(user);
                res.status(200).json({"user:": user});
            }
        });
    } catch (error) {
        next(error);
    }
    
});

export default router;
