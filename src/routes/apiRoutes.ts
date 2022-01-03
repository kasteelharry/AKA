import express from "express";
import productRouter from './Product';
import customersRouter from './customers';
const router = express.Router();
router.use('/customers', customersRouter);
router.use('/products', productRouter);

export default router;