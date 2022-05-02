import getDatabase from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import EventsQueries from '@dir/queries/EventsQueries';
import { convertStringToSQLDate } from '@dir/util/ConvertStringToSQLDate';
import express from 'express';

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//
/* POST create new event type */
router.post('/', async (req, res, next) => {
    const name = req.body.name;
    const type = req.body.eventID;
    let startTime = convertStringToSQLDate(req.body.startTime);
    if (startTime === undefined) {
        startTime = convertStringToSQLDate((new Date()).toISOString());
    }
    const endTime = req.body.endTime;
    const saved = req.body.saved;
    const event = new EventsQueries(getDatabase());
    event.createNewEvent(name, type, startTime, endTime, saved).then(events => {
        res.status(200).json({ event: events });
    }).catch(err => next(err));
});

/* POST create new event type price */
router.post('/:eventsID/prices', async (req, res, next) => {
    const eventsID = req.params.eventsID;
    const productID = req.body.productID;
    const price = parseInt(req.body.price, 10);
    if (isNaN(price)) {
        next(new GeneralServerError('Please enter a price in cents.'));
    } else {
        const event = new EventsQueries(getDatabase());
        event.setEventPrices(eventsID, productID, price).then(prices => {
            res.status(200).json({ eventTypesPrices: prices });
        }).catch(err => next(err));
    }
});

//
// ------------------------- Retrieve endpoints -------------------------
//

/* GET all events listing. */
router.get('/', (req, res, next) => {
    const event = new EventsQueries(getDatabase());
    event.getAllEvents().then(events => {
        res.status(200).json({ events: events });
    }).catch(err => next(err));
});

/* GET active listing. */
router.get('/active', (req, res, next) => {
    const event = new EventsQueries(getDatabase());
    event.getActiveEvent().then(events => {
        res.status(200).json({ events: events });
    }).catch(err => next(err));
});

/* GET events listing by id or name. */
router.get('/:eventID', (req, res, next) => {
    const eventType = req.params.eventID;
    const event = new EventsQueries(getDatabase());
    event.getEvent(eventType).then(events => {
        res.status(200).json({ events: events });
    }).catch(err => next(err));
});

/* GET events prices listing by id or name. */
router.get('/:eventID/prices', (req, res, next) => {
    const eventID = req.params.eventID;
    const event = new EventsQueries(getDatabase());
    event.getEventPricesByEvent(eventID).then(prices => {
        res.status(200).json({ events: prices });
    }).catch(err => next(err));
});

/* GET events prices listing by id or name for product. */
router.get('/:eventID/:productID/prices', (req, res, next) => {
    const eventID = req.params.eventID;
    const productID = req.params.productID;
    const event = new EventsQueries(getDatabase());
    event.getEventPricesByEventAndProduct(eventID, productID).then(prices => {
        res.status(200).json({ events: prices });
    }).catch(err => next(err));
});

//
// ------------------------- Update endpoints -------------------------
//
/* POST to update the properties for an event */
router.post('/:eventID', (req, res, next) => {
    const eventID = req.params.eventID;
    const startTime = convertStringToSQLDate(req.body.startTime);
    const endTime = convertStringToSQLDate(req.body.endTime);
    const params = new Map<string, string | number | undefined>();
    params.set('name', req.body.name);
    params.set('eventType', req.body.eventType);
    params.set('startTime', startTime);
    params.set('endTime', endTime);
    params.set('saved', req.body.saved);
    const event = new EventsQueries(getDatabase());
    event.updateEvent(eventID, params).then(result => {
        res.status(200).json(result);
    }).catch(err => next(err));
});

/* POST to save an event */
router.post('/:eventID/save', (req, res, next) => {
    const eventID = req.params.eventID;
    const saved = req.body.saved;
    const event = new EventsQueries(getDatabase());
    event.saveEvent(eventID, saved).then(result => {
        res.status(200).json(result);
    }).catch(err => next(err));
});

/* POST to update the price for a product of an event  */
router.post('/:eventID/prices/update', (req, res, next) => {
    const eventID = req.params.eventID;
    const productID = req.body.productID;
    const price = req.body.price;
    const priceNum = parseInt(price, 10);
    if (isNaN(priceNum) || (priceNum % 1) !== 0) {
        next(new GeneralServerError('Please enter a price in euro cents.'));
    }
    const event = new EventsQueries(getDatabase());
    event.updateEventPrices(eventID, productID, priceNum).then(result => {
        res.status(200).json(result);
    }).catch(err => next(err));
});

//
// ------------------------- Delete endpoints -------------------------
//

/* POST to delete an event type */
router.post('/:eventID/delete', (req, res, next) => {
    const eventID = req.params.eventID;
    const event = new EventsQueries(getDatabase());
    event.deleteEvent(eventID).then(result => {
        if (result.affectedRows === 1) {
            res.status(200).json({ event: 'The event has been deleted' });
        } else {
            next(new EmptySQLResultError('No entry found for ' + eventID));
        }
    }).catch(err => next(err));
});

/* POST to delete a product price of an event type */
router.post('/:eventID/prices/delete', (req, res, next) => {
    const eventID = req.params.eventID;
    const productID = req.body.productID;
    const event = new EventsQueries(getDatabase());
    event.deleteEventPrice(eventID, productID).then(result => {
        if (result.affectedRows === 1) {
            res.status(200).json({ event: 'The event has been deleted' });
        } else {
            next(new EmptySQLResultError('No entry found for ' + eventID));
        }
    }).catch(err => next(err));
});

export default router;
