import express from 'express';
import { OkPacket, RowDataPacket } from 'mysql2';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';
import { archiveProductByID, createNewProduct, deleteProductNameByID, getAllProducts, getProductByID, updateProductNameByID } from '../database/queries/productQueries';
import { authenticateUser } from '../util/UserAuthentication';

const router = express.Router();

// 
// ------------------------- Create endpoints -------------------------
// 

router.post('/', async (req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            const name = req.body.name;
            createNewProduct(name, (err: Error, product: OkPacket) => {
                if (err) {
                    next(err)
                } else {
                    res.status(200).json({ "productId:": product })
                }
            });
        } else {
            return res.redirect("../");
        }
    });

});

// 
// ------------------------- Retrieve statements -------------------------
// 

router.get('/', (req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            getAllProducts((err: Error, product: RowDataPacket[]) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ "products:": product })
                }
            });
        } else {
            return res.redirect("../");
        }
    });

});

router.get('/:productID', (req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            const productID = req.params.productID;
            getProductByID(productID, (err: Error, product: RowDataPacket) => {
                if (err) {
                    next(err)
                } else {
                    res.status(200).json({ "product:": product });
                }
            });
        } else {
            return res.redirect("../");
        }
    });

});

// 
// ------------------------- Update statements -------------------------
// 

router.post('/:productID', (req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            const id = req.params.productID;
            const name = req.body.name;

            updateProductNameByID(id, name, (err: Error, product: OkPacket) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ "product:": product });
                }
            });
        } else {
            return res.redirect("../");
        }
    });


});


router.post('/:productID/archive', (req, res, next) => {
    authenticateUser(req.sessionID).then(val => {
        if (val) {
            return res.redirect("customers");
        } else {
            return res.redirect("../");
        }
    });
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
    authenticateUser(req.sessionID).then(val => {
        if (val) {
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
        } else {
            return res.redirect("../");
        }
    });

});

export default router;