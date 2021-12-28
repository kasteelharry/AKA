import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { createNewProduct, getAllProducts, getProductByID } from '../database/queries/productQueries';

const router = express.Router();

router.get('/', (req, res, next) => {
    getAllProducts((err:Error,product:RowDataPacket[]) => {
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
    getProductByID(productID, (err:Error, product:RowDataPacket) => {
        if (err) {
            next(err)
        } else {
            console.log(product);
            res.status(200).json({"product:":product});
        }
    });
});

router.post('/', async (req, res, next) => {
    const name = req.body.name;
    createNewProduct(name, (err:Error,product:OkPacket) => {
        if(err) {
            next(err)
        } else {
            const productId = product.insertId;
            res.status(200).json({"productId:": productId})
        }
    });
});

export default router;