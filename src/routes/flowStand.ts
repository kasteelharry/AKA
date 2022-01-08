import getDatabase from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import FlowStandQueries from "@dir/queries/FlowStandQueries";
import express from "express";

const router = express.Router();


//
// ------------------------- Create endpoints -------------------------
//
router.post("/", async (req, res, next) => {
    const eventID = parseInt(req.body.eventID, 10);
    const start = parseInt(req.body.eventID, 10);
    const end = parseInt(req.body.eventID, 10);
    if (isNaN(eventID) || isNaN(start)) {
        next(new GeneralServerError("Bad parameters given."));
    }
    const flow = new FlowStandQueries(getDatabase());
    flow.createNewFlowStand(eventID, start, end).then(stand => {
        res.status(200).json({ "flowstand:": stand });
    }).catch(err => {
        if (err.message.match("Duplicate entry")) {
            next(new ItemAlreadyExistsError("Given flowstand for " +  eventID + " already exists."));
        } else {
            next(err);
        }
    });
});
//
// ------------------------- Retrieve endpoints -------------------------
//

router.get("/", async (req, res, next) => {
    const flow = new FlowStandQueries(getDatabase());
    flow.getAllFlowStand().then(stand => {
        res.status(200).json({"flowstand:": stand});
    }).catch(err => next(err));
});

router.get("/:eventID", async (req, res, next) => {
    const eventID = req.params.eventID;
    const flow = new FlowStandQueries(getDatabase());
    flow.getFlowStandByEvent(eventID).then(stand => {
        res.status(200).json({"flowstand:": stand});
    }).catch(err => next(err));
});

//
// ------------------------- Update endpoints -------------------------
//

router.post("/:eventID", async (req, res, next) => {
    const eventID = req.params.eventID;
    const start = parseInt(req.body.eventID, 10);
    const end = parseInt(req.body.eventID, 10);
    if (isNaN(start) && start !== undefined) {
        next(new GeneralServerError("Bad parameters given."));
    }
    const flow = new FlowStandQueries(getDatabase());
    flow.updateFlowStand(eventID, start, end).then(stand => {
        res.status(200).json({"flowstand:": stand});
    }).catch(err => next(err));
});


//
// ------------------------- Delete endpoints -------------------------
//

router.post("/:eventID/delete", async (req, res, next) => {
    const eventID = req.params.eventID;
    const flow = new FlowStandQueries(getDatabase());
    flow.deleteFlowstand(eventID).then(stand => {
        if (stand.affectedRows === 1) {
            res.status(200).json({ "hotkey:": "The product has been deleted" });
        } else {
            next(new EmptySQLResultError("No entry found for " + eventID));
        }}).catch(err => next(err));
});

export default router;