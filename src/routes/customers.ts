import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';
import { convertStringToSQLDate } from '../util/ConvertStringToSQLDate';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';
import CustomerQueries from '../queries/CustomerQueries';
import getDatabase from '../app';

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
    const customer = new CustomerQueries(getDatabase());
        customer.createNewCustomer(name, mySQLDateString, bank).then(customers => {
            res.status(200).json({ "customer:": customers });
        }).catch(err =>{
            if (err.message.match("Duplicate entry")) {
                if (err.message.match("Bank")) {
                    next(new ItemAlreadyExistsError("Given bankaccount already exists."));
                } else {
                    next(err);
                }
            } else {
                next(err);
            }
        });
});

//
// ------------------------- Retrieve endpoints -------------------------
//

/* GET customer listing. */
router.get('/', (req, res, next) => {
    const customer = new CustomerQueries(getDatabase());
        customer.getAllCustomers().then(customers => {
            res.status(200).json({ "customer:": customers });
        }).catch(err => next(err));
});

/* GET customer by customer id listing. */
router.get('/:customerID', (req, res, next) => {
    try {
        const customer = new CustomerQueries(getDatabase());
        customer.getCustomerByID(req.params.customerID).then(customers => {
            res.status(200).json({ "customer:": customers });
        }).catch(err => next(err));
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
        const customer = new CustomerQueries(getDatabase());
        customer.updateCustomer(req.params.customerID, params).then(customers => {
            res.status(200).json({ "customer:": customers });
        }).catch(err => next(err));
    } catch (error) {
        next(error);
    }
});

//
// ------------------------- Delete endpoints -------------------------
//

/* POST to delete a customer from the database. */
router.post('/:customerID/delete', (req, res, next) => {
    const customer = new CustomerQueries(getDatabase());
        customer.deleteCustomer(req.params.customerID).then(customers => {
            if (customers.affectedRows === 1) {
                res.status(200).json({ "customers:": "The customer has been deleted" });
            } else {
                next(new EmptySQLResultError("No entry found for " + req.params.customerID));
            }
        }).catch(err => next(err));
});

export default router;
