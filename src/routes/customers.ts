import express from 'express'
import { RowDataPacket } from 'mysql2';
import {getAllCustomers, getCustomerByID} from '../database/queries/customerQueries'

const router = express.Router();
/* GET users listing. */
router.get('/', (req, res, next) => {
    getAllCustomers((err: Error, users: RowDataPacket[]) => {
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
        getCustomerByID(req.params.userId, (err: Error, user: RowDataPacket) => {
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
