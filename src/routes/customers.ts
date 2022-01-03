import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';
import { createNewCustomer, deleteCustomer, getAllCustomers, getCustomerByID, updateCustomer } from '../database/queries/customerQueries';
import { convertStringToSQLDate } from '../util/ConvertStringToSQLDate';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';
import { authenticateUser } from '../util/UserAuthentication';

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
                    next(new ItemAlreadyExistsError("Given bankaccount already exists."));
                } else {
                    next(err);
                }
            } else {
                next(err);
            }
        } else {
            res.status(200).json({ "productId:": product });
        }
    });
});

//
// ------------------------- Retrieve endpoints -------------------------
//

/* GET customer listing. */
router.get('/', (req, res, next) => {
    console.log(req.sessionID);

    getAllCustomers((err: Error, customers: RowDataPacket[]) => {
        if (err) {
            next(err);
        }
        else {
            res.status(200).json({ "users:": customers });
        }
    });
});

/* GET customer by customer id listing. */
router.get('/:customerID', (req, res, next) => {
    try {
        getCustomerByID(req.params.customerID, (err: Error, customer: RowDataPacket) => {
            if (err) {
                next(err);
            }
            else {
                res.status(200).json({ "customer:": customer });
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
router.post('/:customerID', (req, res, next) => {
    try {
        const birthday = convertStringToSQLDate(req.body.birthday);
        const params = new Map<string, string | number | undefined>();
        params.set("name", req.body.name);
        params.set("birthday", birthday);
        params.set("bankaccount", req.body.bankaccount);
        params.set("active", req.body.active);
        updateCustomer(req.params.customerID, params, (err: Error, customer: RowDataPacket) => {
            if (err) {
                next(err);
            }
            else {
                res.status(200).json({ "customer:": customer });
            }
        });
    } catch (error) {
        next(error);
    }
});

//
// ------------------------- Delete endpoints -------------------------
//

/* POST to delete a customer from the database. */
router.post('/:customerID/delete', (req, res, next) => {
    deleteCustomer(req.params.customerID, (err: Error, customer: RowDataPacket) => {
        if (err) {
            next(err);
        } else {
            if (customer.affectedRows === 1) {
                res.status(200).json({ "customers:": "The customer has been deleted" });
            } else {
                next(new EmptySQLResultError("No entry found for " + req.params.customerID));
            }
        }
    });
});

export default router;
