import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';
import { archiveProductByID, createNewProduct, deleteProductNameByID, getAllProducts, getProductByID, updateProductNameByID } from '../database/queries/productQueries';

const router = express.Router();

// 
// ------------------------- Create endpoints -------------------------
// 

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

// 
// ------------------------- Retrieve statements -------------------------
// 

router.get('/', (req, res, next) => {
    getAllProducts((err: Error, product: RowDataPacket[]) => {
        if (err) {
            next(err);
        } else {
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
            res.status(200).json({ "product:": product });
        }
    });
});

// 
// ------------------------- Update statements -------------------------
// 

router.post('/:productID', (req, res, next) => {
    const id = req.params.productID;
    const name = req.body.name;

    updateProductNameByID(id, name, (err: Error, product: OkPacket) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ "product:": product });
        }
    });

});


router.post('/:productID/archive', (req, res, next) => {
    const id = req.params.productID;
    const archive = req.body.archive;
    archiveProductByID(id, archive, (err: Error, product: RowDataPacket) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ "product:": product });
        }
    });
});



// 
// ------------------------- Delete statements -------------------------
// 

router.post('/:productID/delete', (req, res, next) => {
    const id = req.params.productID;
    deleteProductNameByID(id, (err: Error, product: RowDataPacket) => {
        if (err) {
            next(err);
        } else {
            if (product.affectedRows == 1) {
                res.status(200).json({ "product:": "The product has been deleted" });
            } else {
                next(new EmptySQLResultError("No entry found for " + id));
            }

        }
    });
});

export default router;