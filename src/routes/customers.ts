import express from 'express'
import { OkPacket, RowDataPacket } from 'mysql2';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';
import {createNewCustomer, getAllCustomers, getCustomerByID, updateCustomer } from '../database/queries/customerQueries'
import { convertStringToSQLDate } from '../util/ConvertStringToSQLDate';

const router = express.Router();


// 
// ------------------------- Create endpoints -------------------------
// 

/* POST create new customer */
router.post('/', async (req, res, next) => {
    const name = req.body.name;
    const bank = req.body.bank;
    const birthDate = req.body.birthday;
    const mySQLDateString = convertStringToSQLDate(birthDate);
    createNewCustomer(name, mySQLDateString, bank, (err: Error, product: OkPacket) => {
        if (err) {
            if (err.message.match("Duplicate entry")) {
                if (err.message.match("Bank")) {
                    next(new ItemAlreadyExistsError("Given bankaccount already exists.")) 
                } else {
                    next(err);
                }
            } else {
                next(err);
            }
        } else {
            res.status(200).json({ "productId:": product })
        }
    });
});

// 
// ------------------------- Retrieve endpoints -------------------------
// 

/* GET customer listing. */
router.get('/', (req, res, next) => {
    getAllCustomers((err: Error, customers: RowDataPacket[]) => {
        if (err) {
          next(err);
        }
        else {
            console.log(customers);
            res.status(200).json({"users:": customers});
        }
    });
});

/* GET customer by customer id listing. */
router.get('/:customerID', (req, res, next) => {
    console.log(req.params.customerID);
    try {
        getCustomerByID(req.params.customerID, (err: Error, customer: RowDataPacket) => {
            if (err) {
                next(err);
            }
            else {

                res.status(200).json({"customer:": customer});
            }
        });
    } catch (error) {
        next(error);
    }
    
});

// 
// ------------------------- Update endpoints -------------------------
// 

/* POST to update the attributes of the customer. */
router.post('/:customerID', (req, res, next) =>{
    try {
        const birthday = convertStringToSQLDate(req.body.birthday);
        const params = new Map<string, string | number>();
        params.set("name", req.body.name);
        params.set("birthday", req.body.birthday);
        params.set("bankaccount", req.body.bankaccount);
        params.set("active", req.body.active);
        updateCustomer(req.params.customerID, params, (err: Error, customer: RowDataPacket) => {
            if (err) {
                next(err);
            }
            else {
                res.status(200).json({"customer:": customer});
            }
        });
    } catch (error) {
        next(error)
    }
});




export default router;
