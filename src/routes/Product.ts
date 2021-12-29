import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';
import { createNewProduct, getAllProducts, getProductByID, updateProductNameByID } from '../database/queries/productQueries';
import { resolve } from 'path';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';

const router = express.Router();

router.get('/', (req, res, next) => {
    getAllProducts((err: Error, product: RowDataPacket[]) => {
        if (err) {
            next(err);
        } else {
            console.log(product);
            res.status(200).json({ "products:": product })
        }
    });
});

router.get('/:productID', (req, res, next) => {
    const productID = req.params.productID;
    getProductByID(productID, (err: Error, product: RowDataPacket) => {
        if (err) {
            next(err)
        } else {
            console.log(product);
            res.status(200).json({ "product:": product });
        }
    });
});

router.post('/', async (req, res, next) => {
    const name = req.body.name;
    createNewProduct(name, (err: Error, product: OkPacket) => {
        if (err) {
            next(err)
        } else {
            const productId = product.insertId;
            res.status(200).json({ "productId:": productId })
        }
    });
});

router.post('/:productID', (req, res, next) => {
    const id = req.body.id;
    const name = req.body.name;
    let updated = false;

    const result = 
        updateProductNameByID(id, name, (err: Error, product: OkPacket) => {
            if (err) {
                next(err);
            } else {
                if (product.changedRows == 1) {
                    console.log('Changed the product');

                    updated = true;
                }
            }
            if(product.affectedRows == 1) {
                next(new ItemAlreadyExistsError());
            }
            if (updated) {
                getProductByID(id, async (err: Error, product: RowDataPacket) => {
                    if (err) {
                        next(err)
                    } else {
                        res.status(200).json({ "product:": product });
                    }
                });
            
            } else {
                next(new EmptySQLResultError('Was unable to find a match for the id.'));
            }
        });
    ;
    
    

});

export default router;