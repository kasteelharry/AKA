import getDatabase from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import FlowStandQueries from '@dir/queries/FlowStandQueries';
import express from 'express';

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//
router.post('/', async (req, res, next) => {
    const eventID = parseInt(req.body.eventID, 10);
    const start = parseInt(req.body.start, 10);
    const end = parseInt(req.body.end, 10);
    if (isNaN(eventID) || isNaN(start)) {
        next(new GeneralServerError('Bad parameters given.'));
    }
    const flow = new FlowStandQueries(getDatabase());
    flow.createNewFlowStand(eventID, start, end).then(stand => {
        res.status(200).json({ flowstand: stand });
    }).catch(err => next(err));
});
//
// ------------------------- Retrieve endpoints -------------------------
//

router.get('/', async (req, res, next) => {
    const flow = new FlowStandQueries(getDatabase());
    flow.getAllFlowStand().then(stand => {
        res.status(200).json({ flowstand: stand });
    }).catch(err => next(err));
});

router.get('/:eventID', async (req, res, next) => {
    const eventID = req.params.eventID;
    const flow = new FlowStandQueries(getDatabase());
    flow.getFlowStandByEvent(eventID).then(stand => {
        res.status(200).json({ flowstand: stand });
    }).catch(err => next(err));
});

//
// ------------------------- Update endpoints -------------------------
//

router.put('/update', async (req, res, next) => {
    const eventID = req.body.eventID;
    const start = parseInt(req.body.start, 10);
    const end = parseInt(req.body.end, 10);
    if (isNaN(eventID)) {
        next(new GeneralServerError('Bad parameters given.'));
    }
    const flow = new FlowStandQueries(getDatabase());
    flow.updateFlowStand(eventID, start, end).then(stand => {
        res.status(200).json({ flowstand: stand });
    }).catch(err => next(err));
});

//
// ------------------------- Delete endpoints -------------------------
//

router.post('/delete', async (req, res, next) => {
    const eventID = req.body.eventID;
    const flow = new FlowStandQueries(getDatabase());
    flow.deleteFlowstand(eventID).then(stand => {
        if (stand.affectedRows === 1) {
            res.status(200).json({ 'hotkey:': 'The product has been deleted' });
        } else {
            next(new EmptySQLResultError('No entry found for ' + eventID));
        }
    }).catch(err => next(err));
});

export default router;
