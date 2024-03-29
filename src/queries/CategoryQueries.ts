import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';

export default class CategoryQueries {
    constructor (private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Creates a new entry for the categories in the database. If the category
     * already exists, the Promise will return an error. If the category is new
     * the Promise will resolve with the id of the newly inserted entry.
     * @param category - The name of the category.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createNewCategory = (category:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO ak_category (Name) VALUES (?);';
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [category]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                err => {
                    if (err.message.match('Duplicate entry')) {
                        reject(new ItemAlreadyExistsError('Given category ' + category + ' already exists.'));
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    /**
     * Creates a new entry in the table that holds the product, category linking. If the
     * category and product can be linked together, the promise will resolve into the
     * insertion ID of the new entry, if the entry already exists or another error
     * occurs. the promise will be rejected with the error.
     * @param product - The ID or name of the product
     * @param category - The ID or name of the category
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    setProductCategory = (product:string, category:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'INSERT INTO ak_productcategory (CategoryID, ProductID) ' +
            'VALUES(?,?)';
            const queryB = 'INSERT INTO ak_productcategory (CategoryID, ProductID) ' +
            'VALUES((SELECT c.id FROM ak_category c WHERE c.name = ?),?)';
            const queryC = 'INSERT INTO ak_productcategory (CategoryID, ProductID) ' +
            'VALUES(?,(SELECT p.id FROM ak_products p WHERE p.name = ?))';
            const queryD = 'INSERT INTO ak_productcategory (CategoryID, ProductID) ' +
            'VALUES((SELECT c.id FROM ak_category c WHERE c.name = ?),' +
            '(SELECT p.id FROM ak_products p WHERE p.name = ?))';
            let query = '';
            const prodNum = parseInt(product, 10);
            const catNum = parseInt(category, 10);
            if (isNaN(prodNum) && isNaN(catNum)) {
                query = queryD;
            } else if (isNaN(prodNum)) {
                query = queryC;
            } else if (isNaN(catNum)) {
                query = queryB;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [category, product]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                err => {
                    if (err.message.match('Duplicate entry')) {
                        reject(new ItemAlreadyExistsError('Given category ' + category + ' already exists.'));
                    } else {
                        reject(err);
                    }
                }
            );
        });
    }

    //
    // ------------------------- Retrieve statements -------------------------
    //

    /**
     * Retrieves all the categories from the database. If everything goes correct,
     * the promise will resolve into the results, otherwise it will be rejected with
     * an error.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllCategories = ():Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM ak_category';
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: []
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                err => reject(err)
            );
        });
    }

    /**
     * Retrieves all the categories and the products associated with it from the database.
     * All the products associated to the category are put into a single JSON array for easier
     * extraction later on. If anything goes wrong, the promise will be rejected with the error.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllCategoriesAndProducts = ():Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT c.id, c.name, c.archived, JSON_ARRAYAGG(pc.productID) as productID, ' +
            'JSON_ARRAYAGG(p.name) as products FROM ak_category c ' +
            'LEFT JOIN ak_productCategory pc ' +
            'ON c.id = pc.CategoryID ' +
            'LEFT JOIN ak_products p ' +
            'ON p.id = pc.ProductID ' +
            'GROUP BY c.id, c.name, c.archived';
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: []
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                err => reject(err)
            );
        });
    }

    /**
     * Obtains a single category from the database based on name or ID. The promise should
     * resolve with the category that matches the given name or ID. If anything goes wrong,
     * the promise will be rejected with the error.
     * @param category - The name or ID of the category.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getSingleCategory = (category:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'SELECT * FROM ak_category c WHERE c.id = ?';
            const queryB = 'SELECT * FROM ak_category c WHERE c.name = ?';
            let query = '';
            const numberID = parseInt(category, 10);
            if (isNaN(numberID)) {
                query = queryB;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [category]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                err => reject(err)
            );
        });
    }

    //
    // ------------------------- Update statements -------------------------
    //

    /**
     * Updates a category with the new name. If the update goes successfully,
     * the promise will be resolved with the newly updated category. If not
     * updated successfully, the promise will be rejected with an error.
     * @param categoryID - The name or ID of the category.
     * @param newName - The new name of the category.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateCategoryName = (categoryID:string, newName:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'UPDATE ak_category c SET c.name = ? WHERE c.id = ?';
            const queryB = 'UPDATE ak_category c SET c.name = ? WHERE c.name = ?';
            const queryC = 'SELECT * FROM ak_category c WHERE c.id = ?';
            const queryD = 'SELECT * FROM ak_category c WHERE c.name = ?';
            let queryToPerform = '';
            let secondQuery = '';
            let finalID = categoryID;
            const numberID = parseInt(categoryID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryB;
                secondQuery = queryD;
                finalID = newName;
            } else {
                queryToPerform = queryA;
                secondQuery = queryC;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [newName, categoryID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [finalID]
                }
            ]).then(
                val => {
                    const queryResults = val[1].result;
                    if (queryResults.changedRows === 1) {
                        resolve(val[2].result);
                    } else if (queryResults.affectedRows === 1) {
                        reject(new ItemAlreadyExistsError());
                    } else {
                        reject(new EmptySQLResultError('Was unable to find a match for the id.'));
                    }
                }).catch(
                err => reject(err)
            );
        });
    }

    /**
     * Archives a category. If archived successfully, the promise will resolve
     * with the newly archived category. If not, the promise will be rejected
     * with an error.
     * @param categoryID - The name or ID of the category.
     * @param archive - contains true or false in string form.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    archiveCategory = (categoryID: string, archive: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'UPDATE ak_category c SET c.archived = ? WHERE c.id = ?';
            const queryB = 'UPDATE ak_category c SET c.archived = ? WHERE c.name = ?';
            const queryC = 'SELECT * FROM ak_category c WHERE c.id = ?';
            const queryD = 'SELECT * FROM ak_category c WHERE c.name = ?';
            let queryToPerform = '';
            let secondQuery = '';
            const archiveNum = (archive === 'true') ? 1 : 0;
            const numberID = parseInt(categoryID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryB;
                secondQuery = queryD;
            } else {
                queryToPerform = queryA;
                secondQuery = queryC;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [archiveNum, categoryID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [categoryID]
                }
            ]).then(
                val => {
                    const queryResults = val[1].result;
                    if (queryResults.changedRows === 1) {
                        resolve(val[2].result);
                    } else if (queryResults.affectedRows === 1) {
                        reject(new ItemAlreadyExistsError());
                    } else {
                        reject(new EmptySQLResultError('Was unable to find a match for the id.'));
                    }
                }).catch(
                err => reject(err)
            );
        });
    }

    //
    // ------------------------- Delete statements -------------------------
    //

    /**
     * Deletes a category from the database. If failed, it will be rejected with the error.
     * @param categoryID - The ID or name of the category.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteCategory = (categoryID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = 'DELETE FROM ak_category c WHERE c.id = ?;';
            const queryTwo = 'DELETE FROM ak_category c WHERE c.name = ?';
            let queryToPerform = '';
            const numberID = parseInt(categoryID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
            } else {
                queryToPerform = queryOne;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [categoryID]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                err => reject(err)
            );
        });
    }

    /**
     * Deletes a product and category from the database table that keeps track of the
     * products and their categories. If failed, the promise will be rejected with an error.
     * @param categoryID The ID of the category.
     * @param productID The ID of the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteProductCategory = (categoryID: number, productID:number): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM ak_productCategory c WHERE c.CategoryID = ? AND c.ProductID = ?;';
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [categoryID, productID]
                }
            ]).then(
                val => {
                    resolve(val[1].result);
                }).catch(
                err => reject(err)
            );
        });
    }
}
