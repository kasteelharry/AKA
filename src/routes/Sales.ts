import getDatabase from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import SalesQueries from "@dir/queries/SalesQueries";
import { convertStringToSQLDate } from "@dir/util/ConvertStringToSQLDate";
import express from "express";

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//

router.post('/', (req, res, next) => {
    const event = parseInt(req.body.eventID, 10);
    const product = parseInt(req.body.productID, 10);
    const amount = parseInt(req.body.amount, 10);
    const timestamp = convertStringToSQLDate(req.body.timestamp);
    const sale = new SalesQueries(getDatabase());
    sale.createSale(event, product, amount, timestamp).then(result => {
        res.status(200).json({"sale:": result});
    }).catch(err => next(err));
});


router.post('/customers', (req, res, next) => {
    const customer = parseInt(req.body.customerID, 10);
    const event = parseInt(req.body.eventID, 10);
    const product = parseInt(req.body.productID, 10);
    const amount = parseInt(req.body.amount, 10);
    const timestamp = convertStringToSQLDate(req.body.timestamp);
    const sale = new SalesQueries(getDatabase());
    sale.createCustomerSale(customer,event, product, amount, timestamp).then(result => {
        res.status(200).json({"sale:": result});
    }).catch(err => next(err));
});

//
// ------------------------- Retrieve endpoints -------------------------
//
router.get('/', (req, res, next) => {
    const sale = new SalesQueries(getDatabase());
    sale.getAllSales().then(result => {
        res.status(200).json({"sale:": result});
    }).catch(err => next(err));
});

router.get('/events/:eventID', (req, res, next) => {
    const event = parseInt(req.params.eventID,10);
    const sale = new SalesQueries(getDatabase());
    sale.getAllSalesEvent(event).then(result => {
        res.status(200).json({"sale:": result});
    }).catch(err => next(err));
});

router.get('/customers/:customerID', (req, res, next) => {
    const customer = parseInt(req.params.customerID,10);
    const sale = new SalesQueries(getDatabase());
    sale.getAllSalesByUser(customer).then(result => {
        res.status(200).json({"sale:": result});
    }).catch(err => next(err));
});

router.get('/customers/:customerID/:eventID', (req, res, next) => {
    const customer = parseInt(req.params.customerID,10);
    const event = parseInt(req.params.eventID,10);
    const sale = new SalesQueries(getDatabase());
    sale.getAllSalesByUserAndEvent(customer, event).then(result => {
        res.status(200).json({"sale:": result});
    }).catch(err => next(err));
});

router.get('/timestamp/:timestamp', (req, res, next) => {
    const timestamp = convertStringToSQLDate(req.params.timestamp);
    if (timestamp === undefined) {
        next(new GeneralServerError("Please enter a correct date."));
    } else {
        const sale = new SalesQueries(getDatabase());
        sale.getSaleByTimeStamp(timestamp).then(result => {
            res.status(200).json({"sale:": result});
        }).catch(err => next(err));
    }
});

router.get('/timestamp/:timestamp/:timestamp2', (req, res, next) => {
    const timestamp = convertStringToSQLDate(req.params.timestamp);
    const timestamp2 = convertStringToSQLDate(req.params.timestamp2);
    if (timestamp === undefined || timestamp2 === undefined) {
        next(new GeneralServerError("Please enter a correct date."));
    } else {
        const sale = new SalesQueries(getDatabase());
        sale.getSaleByTimeStampInterval(timestamp, timestamp2).then(result => {
            res.status(200).json({"sale:": result});
        }).catch(err => next(err));
    }
});


//
// ------------------------- Update endpoints -------------------------
//

router.post('/update', (req, res, next) => {
    const timestamp = convertStringToSQLDate(req.body.timestamp);
    const event = parseInt(req.body.eventID, 10);
    const product = parseInt(req.body.productID, 10);
    const amount = parseInt(req.body.amount, 10);
    const customer = parseInt(req.body.customerID, 10);
    if (timestamp === undefined) {
        next(new GeneralServerError("Please enter a correct date."));
    } else {
        const sale = new SalesQueries(getDatabase());
        sale.updateSalesAndUsers(timestamp, event, customer, product, amount).then(result => {
            res.status(200).json({"sale:": result});
        }).catch(err => next(err));
    }
});

router.post('/customers/update', (req, res, next) => {
    const customer = parseInt(req.body.customerID, 10);
    const timestamp = convertStringToSQLDate(req.body.timestamp);
    const price = parseInt(req.body.totalPrice, 10);
    if (timestamp === undefined) {
        next(new GeneralServerError("Please enter a correct date."));
    } else {
        const sale = new SalesQueries(getDatabase());
        sale.updateUserSale(timestamp, customer, price).then(result => {
            res.status(200).json({"sale:": result});
        }).catch(err => next(err));
    }
});

//
// ------------------------- Delete endpoints -------------------------
//

router.post('/delete', (req, res, next) => {
    const timestamp = convertStringToSQLDate(req.body.timestamp);
    if (timestamp === undefined) {
        next(new GeneralServerError("Please enter a correct date."));
    } else {
        const sale = new SalesQueries(getDatabase());
        sale.deleteUserSale(timestamp).then(result => {
            if (result.affectedRows === 1) {
                res.status(200).json({ "sale:": "The transaction has been deleted." });
            } else {
                next(new EmptySQLResultError("No entry found for " + timestamp));
            }
        }).catch(err => next(err));
    }
});

router.post('/customers/delete', (req, res, next) => {
    const timestamp = convertStringToSQLDate(req.body.timestamp);
    if (timestamp === undefined) {
        next(new GeneralServerError("Please enter a correct date."));
    } else {
        const sale = new SalesQueries(getDatabase());
        sale.deleteUserSale(timestamp).then(result => {
            if (result.affectedRows === 1) {
                res.status(200).json({ "sale:": "The transaction has been deleted." });
            } else {
                next(new EmptySQLResultError("No entry found for " + timestamp));
            }
        }).catch(err => next(err));
    }
});




export default router;