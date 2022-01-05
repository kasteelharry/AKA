import express from 'express';
import getDatabase from '../app';
import ProductQueries from '../queries/ProductQueries';
import { EmptySQLResultError } from '../exceptions/EmptySQLResultError';

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//

router.post('/', async (req, res, next) => {
    const name = req.body.name;
    const prod = new ProductQueries(getDatabase());
    prod.createNewProduct(name).then(product =>  res.status(200).json({ "productId:": product })).catch(err => next(err));

});

//
// ------------------------- Retrieve statements -------------------------
//

router.get('/', (req, res, next) => {
    const prod = new ProductQueries(getDatabase());
    prod.getAllProducts().then(product =>  res.status(200).json({ "products:": product })).catch(err => next(err));
});

router.get('/:productID', (req, res, next) => {
    const productID = req.params.productID;
    const prod = new ProductQueries(getDatabase());
    prod.getProductByID(productID).then(product =>  res.status(200).json({ "products:": product })).catch(err => next(err));
});

//
// ------------------------- Update statements -------------------------
//

router.post('/:productID', (req, res, next) => {
    const id = req.params.productID;
    const name = req.body.name;

    const prod = new ProductQueries(getDatabase());
    prod.updateProductNameByID(id, name).then(product =>  res.status(200).json({ "products:": product })).catch(err => next(err));


});


router.post('/:productID/archive', (req, res, next) => {
    const id = req.params.productID;
    const archive = req.body.archive;
    const prod = new ProductQueries(getDatabase());
    prod.archiveProductByID(id, archive).then(product =>  res.status(200).json({ "products:": product })).catch(err => next(err));
});



//
// ------------------------- Delete statements -------------------------
//

router.post('/:productID/delete', (req, res, next) => {
    const id = req.params.productID;
    const prod = new ProductQueries(getDatabase());
    prod.deleteProductNameByID(id).then(product =>  {
        if (product.affectedRows === 1) {
            res.status(200).json({ "product:": "The product has been deleted" });
        } else {
            next(new EmptySQLResultError("No entry found for " + id));
        }}).catch(err => next(err));
});

export default router;