import express, { NextFunction } from 'express';
import { getAllProducts } from '../database/queries/productQueries';
import { BasicProduct, Product } from "../model/Products";

const router = express.Router();

router.get('/', (req, res, next) => {
    getAllProducts((err:Error,product:Product[]) => {
        if(err) {
            next(err);
        } else {
            console.log(product);
            res.status(200).json({"products:":product})
        }
    });
});

export default router;