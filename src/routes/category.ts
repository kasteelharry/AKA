import getDatabase from "@dir/app";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import CategoryQueries from "@dir/queries/CategoryQueries";
import express from "express";

const router = express.Router();

//
// ------------------------- Create endpoints -------------------------
//

/* POST create new category */
router.post("/", async (req, res, next) => {
    const name = req.body.name;
    const category = new CategoryQueries(getDatabase());
    category.createNewCategory(name).then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => {
            if (err.message.match("Duplicate entry")) {
                next(new ItemAlreadyExistsError(
                    "Given category " + name + " already exists"));
            } else {
                next(err);
            }
        });
});
/* POST link category to a product */
router.post("/products", async (req, res, next) => {
    const cat = req.body.category;
    const prod = req.body.product;
    const category = new CategoryQueries(getDatabase());
    category.setProductCategory(prod, cat).then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => {
            if (err.message.match("Duplicate entry")) {
                next(new ItemAlreadyExistsError(
                    "Given category " + cat + " for product "+ prod +" already exists"));
            } else {
                next(err);
            }
        });
});

//
// ------------------------- Retrieve endpoints -------------------------
//

/* GET all categories */
router.get('/', (req, res, next) => {
    const cat = new CategoryQueries(getDatabase());
    cat.getAllCategories().then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => next(err));
});

/* GET all categories and their products. */
router.get('/products', (req, res, next) => {
    const cat = new CategoryQueries(getDatabase());
    cat.getAllCategoriesAndProducts().then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => next(err));
});

/* GET single category */
router.get('/:categoryID', (req, res, next) => {
    const category = req.params.categoryID;
    const cat = new CategoryQueries(getDatabase());
    cat.getSingleCategory(category).then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => next(err));
});

//
// ------------------------- Update endpoints -------------------------
//

/* POST update a single category name */
router.post('/:categoryID', (req, res, next) => {
    const category = req.params.categoryID;
    const newName = req.body.name;
    const cat = new CategoryQueries(getDatabase());
    cat.updateCategoryName(category, newName).then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => next(err));
});

/* POST archive a category */
router.post('/:categoryID/archive', (req, res, next) => {
    const category = req.params.categoryID;
    const archive = req.body.archive;
    const cat = new CategoryQueries(getDatabase());
    cat.archiveCategory(category, archive).then(result => {
        res.status(200).json({"categories:": result});
    }).catch(err => next(err));
});
//
// ------------------------- Delete endpoints -------------------------
//

/* POST delete a category */
router.post('/delete', (req, res, next) => {
    const category = req.body.categoryID;
    const cat = new CategoryQueries(getDatabase());
    cat.deleteCategory(category).then(result => {
        if (result.affectedRows === 1) {
            res.status(200).json({ "customers:": "The customer has been deleted" });
        } else {
            next(new EmptySQLResultError("No entry found for " + category));
        }
    }).catch(err => next(err));
});

export default router;