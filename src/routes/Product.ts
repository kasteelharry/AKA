import express, { NextFunction } from 'express';
import { getAllProducts, getProductByID } from '../database/queries/productQueries';
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

router.get('/:productID', (req, res, next) => {
    const productID = req.params.productID;
    getProductByID(productID, (err:Error, product:Product) => {
        if (err) {
            next(err)
        } else {
            console.log(product);
            res.status(200).json({"product:":product});
        }
    });
});

export default router;