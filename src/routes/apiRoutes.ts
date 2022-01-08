import express from "express";
import productRouter from './Product';
import customersRouter from './customers';
import eventTypesRouter from './EventTypes';
import eventsRouter from './Events';
const router = express.Router();
router.use('/customers', customersRouter);
router.use('/products', productRouter);
router.use('/eventtypes', eventTypesRouter);
router.use('/events', eventsRouter);
export default router;