import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import getDatabase from '../app';
import ProductQueries from '../database/queries/ProductQueries';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//

router.post('/', async (req, res, next) => {
    const name = req.body.name;
    const prod = new ProductQueries(getDatabase());
    prod.createNewProduct(name, (err: Error | null, product?: OkPacket) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ "productId:": product });
        }
    });

});

//
// ------------------------- Retrieve statements -------------------------
//

router.get('/', (req, res, next) => {
    const prod = new ProductQueries(getDatabase());
    prod.getAllProducts((err: Error | null, product: RowDataPacket[]) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ "products:": product });
        }
    });

});

router.get('/:productID', (req, res, next) => {
    const productID = req.params.productID;
    const prod = new ProductQueries(getDatabase());
    prod.getProductByID(productID, (err: Error | null, product: RowDataPacket) => {
        if (err) {
            next(err);
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
    const prod = new ProductQueries(getDatabase());
    prod.updateProductNameByID(id, name, (err: Error | null, product: OkPacket) => {
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
    const prod = new ProductQueries(getDatabase());
    prod.archiveProductByID(id, archive, (err: Error | null, product: RowDataPacket) => {
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
    const prod = new ProductQueries(getDatabase());
    prod.deleteProductNameByID(id, (err: Error | null, product: RowDataPacket) => {
        if (err) {
            next(err);
        } else {
            if (product.affectedRows === 1) {
                res.status(200).json({ "product:": "The product has been deleted" });
            } else {
                next(new EmptySQLResultError("No entry found for " + id));
            }

        }
    });

});

export default router;