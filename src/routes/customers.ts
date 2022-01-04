import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';
import { convertStringToSQLDate } from '../util/ConvertStringToSQLDate';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';
import { authenticateUser } from '../util/UserAuthentication';
import CustomerQueries from '../database/queries/customerQueries';
import getDatabase from '../app';

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//

/* POST create new customer */
router.post('/', async (req, res, next) => {
    const customer = new CustomerQueries(getDatabase());
    const name = req.body.name;
    const bank = req.body.bank;
    const birthDate = req.body.birthday;
    const mySQLDateString = convertStringToSQLDate(birthDate);
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            customer.createNewCustomer(name, mySQLDateString, bank, (err: Error | null, product: OkPacket) => {
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
        } else {
            return res.redirect("../");
        }
    });
});

//
// ------------------------- Retrieve endpoints -------------------------
//

/* GET customer listing. */
router.get('/', (req, res, next) => {
    const customer = new CustomerQueries(getDatabase());
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            customer.getAllCustomers((err: Error | null, customers: RowDataPacket[]) => {
                if (err) {
                  next(err);
                }
                else {
                    res.status(200).json({"users:": customers});
                }
            });
        } else {
            return res.redirect("../");
        }
    });
});

/* GET customer by customer id listing. */
router.get('/:customerID', (req, res, next) => {
    const customer = new CustomerQueries(getDatabase());
    try {
        authenticateUser(req.sessionID).then(val => {
            if (val) {
                customer.getCustomerByID(req.params.customerID, (err: Error | null, customers: RowDataPacket) => {
                    if (err) {
                        next(err);
                    }
                    else {
                        res.status(200).json({"customer:": customers});
                    }
                });
            } else {
                return res.redirect("../");
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
    const customer = new CustomerQueries(getDatabase());
    try {
        authenticateUser(req.sessionID).then(val => {
            if (val) {
                const birthday = convertStringToSQLDate(req.body.birthday);
        const params = new Map<string, string | number | undefined>();
        params.set("name", req.body.name);
        params.set("birthday", birthday);
        params.set("bankaccount", req.body.bankaccount);
        params.set("active", req.body.active);
        customer.updateCustomer(req.params.customerID, params, (err: Error | null, customers: RowDataPacket) => {
            if (err) {
                next(err);
            }
            else {
                res.status(200).json({"customer:": customers});
            }
        });
            } else {
                return res.redirect("../");
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
    const customer = new CustomerQueries(getDatabase());
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            customer.deleteCustomer(req.params.customerID, (err: Error | null, customers: RowDataPacket) => {
                if (err) {
                    next(err);
                } else {
                    if (customers.affectedRows === 1) {
                        res.status(200).json({ "customers:": "The customer has been deleted" });
                    } else {
                        next(new EmptySQLResultError("No entry found for " + req.params.customerID));
                    }
                }
            });
        } else {
            return res.redirect("../");
        }
    });
});

export default router;
