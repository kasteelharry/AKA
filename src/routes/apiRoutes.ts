import express from "express";
import productRouter from './Product';
import customersRouter from './Customers';
import eventTypesRouter from './EventTypes';
import eventsRouter from './Events';
import hotkeyRouter from './HotKeys';
import flowstandRouter from './FlowStand';
import categoryRouter from './Category';
import salesRouter from './Sales';
const router = express.Router();

// Sets the routes of the api different type of endpoints.
router.use('/customers', customersRouter);
router.use('/products', productRouter);
router.use('/eventtypes', eventTypesRouter);
router.use('/events', eventsRouter);
router.use('/hotkeys', hotkeyRouter);
router.use('/flowstand', flowstandRouter);
router.use('/category', categoryRouter);
router.use('/sales', salesRouter);
export default router;