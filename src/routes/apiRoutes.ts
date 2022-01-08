import express from "express";
import productRouter from './Product';
import customersRouter from './customers';
import eventTypesRouter from './EventTypes';
import eventsRouter from './Events';
import hotkeyRouter from './Hotkeys';
import flowstandRouter from './FlowStand';
const router = express.Router();
router.use('/customers', customersRouter);
router.use('/products', productRouter);
router.use('/eventtypes', eventTypesRouter);
router.use('/events', eventsRouter);
router.use('/hotkeys', hotkeyRouter);
router.use('/flowstand', flowstandRouter);
export default router;