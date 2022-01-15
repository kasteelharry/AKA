
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "@dir/exceptions/ItemAlreadyExistsError";
import { queryType } from "@dir/app";

export default class ProductQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }


    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Creates a new product in the database by inserting the new name. The promise
     * resolves with the insertion id if the product does not already exists. Otherwise
     * it will be rejected with an error.
     * @param product - The name of the new product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createNewProduct = (product: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryToPerform = "INSERT INTO ak_products (Name) VALUES (?);";
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [product]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                    err => {
                        if (err.message.match("Duplicate entry")) {
                            reject(new ItemAlreadyExistsError("Given product " + product + " already exists."));
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
     * Retrieves all the products from the database.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllProducts = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey";
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
     * Gets a single product from the database.
     * @param productID the product ID, can be the name or the id.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getProductByID = (productID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"WHERE p.id = ? "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey;";
            const queryTwo = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"WHERE p.name LIKE ? "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey";
            let queryToPerform = "";
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                productID = '%' + productID + '%';
            } else {
                queryToPerform = queryOne;
            }

            this.database.executeTransactions([

                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [productID]
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
     * Updates the product in the database. If the product was updated successfully
     * then the promise will be resolved with the newly updated product.
     * @param productID - The name or ID of the product.
     * @param newName - The new name for the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateProductNameByID = (productID: string, newName: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "UPDATE ak_products p SET p.name = ? WHERE p.id = ?;";
            const queryTwo = "UPDATE ak_products p SET p.name = ? WHERE p.name = ?";
            const queryThree = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"WHERE p.id = ? "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey;";
            const queryFour = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"WHERE p.name LIKE ? "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey";
            let queryToPerform = "";
            let secondQuery = "";
            const numberID = parseInt(productID, 10);
            let finalID = productID;
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                secondQuery = queryFour;
                finalID = newName;
            } else {
                queryToPerform = queryOne;
                secondQuery = queryThree;
            }
            // executePreparedQuery(queryToPerform, callback, [newName, productID]);
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [newName, productID]
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
     * Archives a product in the database. As for now this will not have any effect
     * on the entire system but in future versions, archived products will not be able
     * to be used in other parts of the system.
     * @param productID - The product ID or name.
     * @param archive - (true or false) which will archive the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    archiveProductByID = (productID: string, archive: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "UPDATE ak_products p SET p.archived = ? WHERE p.id = ?;";
            const queryTwo = "UPDATE ak_products p SET p.archived = ? WHERE p.name = ?;";
            const queryThree = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"WHERE p.id = ? "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey;";
            const queryFour = "SELECT p.id, p.name, p.archived, hk.hotkey, "
            +"JSON_ARRAYAGG(c.name) as category FROM ak_products p "
            +"LEFT JOIN ak_hotkeys hk "
            +"ON p.id = hk.productID "
            +"LEFT JOIN ak_productcategory pc "
            +"ON pc.productID = p.id "
            +"LEFT JOIN ak_category c "
            +"ON c.id = pc.categoryID "
            +"WHERE p.name LIKE ? "
            +"GROUP BY p.id, p.name, p.archived, hk.hotkey";
            let queryToPerform = "";
            let secondQuery = "";
            const archiveNum = (archive === "true") ? 1 : 0;
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                secondQuery = queryFour;
            } else {
                queryToPerform = queryOne;
                secondQuery = queryThree;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [archiveNum, productID]
                },
                {
                    id: 2,
                    query: secondQuery,
                    parameters: [productID]
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
     * Deletes a product from the database.
     * @param productId - The ID or name of the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteProductNameByID = (productId: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "DELETE FROM ak_products p WHERE p.id = ?;";
            const queryTwo = "DELETE FROM ak_products p WHERE p.name LIKE ?";
            let queryToPerform = "";
            const numberID = parseInt(productId, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                productId = '%' + productId + '%';
            } else {
                queryToPerform = queryOne;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query: queryToPerform,
                    parameters: [productId]
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
