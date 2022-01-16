import getDatabase from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import EventTypeQueries from "@dir/queries/EventTypeQueries";
import express from "express";

const router = express.Router();


//
// ------------------------- Create endpoints -------------------------
//

/* POST create new event type */
router.post('/', async (req, res, next) => {
    const name = req.body.name;
    const event = new EventTypeQueries(getDatabase());
    event.createNewEventType(name).then(events => {
        res.status(200).json({ "eventTypes:": events });
    }).catch(err => next(err));
});

/* POST create new event type price */
router.post('/prices', async (req, res, next) => {
    const eventTypeID = req.body.eventTypeID;
    const productID = req.body.productID;
    const price = parseInt(req.body.price, 10);
    if (isNaN(price)) {
        next(new GeneralServerError("Please enter a price in cents."));
    } else {
        const event = new EventTypeQueries(getDatabase());
        event.setEventTypePrices(eventTypeID, productID, price).then(prices => {
            res.status(200).json({ "eventTypesPrices:": prices });
        }).catch(err => next(err));
    }
});


//
// ------------------------- Retrieve endpoints -------------------------
//

/* GET event types listing. */
router.get('/', (req, res, next) => {
    const event = new EventTypeQueries(getDatabase());
    event.getAllEventTypes().then(events => {
        res.status(200).json({ "eventTypes:": events });
    }).catch(err => next(err));
});

/* GET event types listing by id or name. */
router.get('/:eventTypeID', (req, res, next) => {
    const eventType = req.params.eventTypeID;
    const event = new EventTypeQueries(getDatabase());
    event.getEventType(eventType).then(events => {
        res.status(200).json({ "eventTypes:": events });
    }).catch(err => next(err));
});

/* GET event types listing by id or name. */
router.get('/:eventTypeID/prices', (req, res, next) => {
    const eventType = req.params.eventTypeID;
    const event = new EventTypeQueries(getDatabase());
    event.getEventTypePricesByEvent(eventType).then(prices => {
        res.status(200).json({ "eventTypes:": prices });
    }).catch(err => next(err));
});

/* GET event types listing by id or name. */
router.get('/:eventTypeID/:productID/prices', (req, res, next) => {
    const eventType = req.params.eventTypeID;
    const productID = req.params.productID;
    const event = new EventTypeQueries(getDatabase());
    event.getEventTypePricesByEventAndProduct(eventType, productID).then(prices => {
        res.status(200).json({ "eventTypes:": prices });
    }).catch(err => next(err));
});


//
// ------------------------- Update endpoints -------------------------
//
/* POST to update the name for an event type */
router.post('/:eventTypeID', (req, res, next) => {
    const eventTypeID = req.params.eventTypeID;
    const newName = req.body.name;
    const event = new EventTypeQueries(getDatabase());
    event.updateEventType(eventTypeID, newName).then(result => {
        res.status(200).json(result);
    }).catch(err => next(err));
});


/* POST to update the price for a product of an event type */
router.post('/:eventTypeID/prices/update', (req, res, next) => {
    const eventTypeID = req.params.eventTypeID;
    const productID = req.body.productID;
    const price = req.body.price;
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || (priceNum % 1) !== 0) {
        next(new GeneralServerError("Please enter a price in euro cents."));
    }
    const event = new EventTypeQueries(getDatabase());
    event.updateEventTypePrices(eventTypeID, productID, priceNum).then(result => {
        res.status(200).json(result);
    }).catch(err => next(err));
});

//
// ------------------------- Delete endpoints -------------------------
//
/* POST to delete an event type */
router.post('/:eventTypeID/delete', (req, res, next) => {
    const eventTypeID = req.params.eventTypeID;
    const event = new EventTypeQueries(getDatabase());
    event.deleteEventType(eventTypeID).then(result => {
        if (result.affectedRows === 1) {
            res.status(200).json({ "customers:": "The customer has been deleted" });
        } else {
            next(new EmptySQLResultError("No entry found for " + eventTypeID));
        }
    }).catch(err => next(err));
});

/* POST to delete a product price of an event type */
router.post('/:eventTypeID/prices/delete', (req, res, next) => {
    const eventTypeID = req.params.eventTypeID;
    const productID = req.body.productID;
    const event = new EventTypeQueries(getDatabase());
    event.deleteEventTypePrice(eventTypeID,productID).then(result => {
        if (result.affectedRows === 1) {
            res.status(200).json({ "customers:": "The customer has been deleted" });
        } else {
            next(new EmptySQLResultError("No entry found for " + eventTypeID));
        }
    }).catch(err => next(err));
});

export default router;