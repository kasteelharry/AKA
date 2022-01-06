
import { OkPacket } from "mysql2";
import { EmptySQLResultError } from "../exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "../exceptions/ItemAlreadyExistsError";
import { queryType } from "../app";

export default class ProductQueries {

    constructor(private database: Database<queryType>) {
        this.database = database;
    }


    //
    // ------------------------- Create statements -------------------------
    //

    /**
     * Creates a new product with just the name.
     * @param product the name of the product.
     * @param callback callback method containing the result of the queryToPerform.
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
                            reject(new ItemAlreadyExistsError("Given product already exists."));
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
     * Gets all the products from the database.
     * @param callback callback method containing the result of the queryToPerform.
     */
    getAllProducts = (): Promise<any> => {
        return new Promise((resolve, reject) => {
            this.database.executeTransactions([
                {
                    id: 1,
                    query: "SELECT * FROM ak_products",
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
     * @param callback callback method containing the result of the queryToPerform.
     */
    getProductByID = (productID: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "SELECT * FROM ak_products p WHERE p.id = ?;";
            const queryTwo = "SELECT * FROM ak_products p WHERE p.name LIKE ?";
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

    updateProductNameByID = (productID: string, newName: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "UPDATE ak_products p SET p.name = ? WHERE p.id = ?;";
            const queryTwo = "UPDATE ak_products p SET p.name = ? WHERE p.name LIKE ?";
            const queryThree = "SELECT * FROM ak_products p WHERE p.id = ?;";
            const queryFour = "SELECT * FROM ak_products p WHERE p.name LIKE ?";
            let queryToPerform = "";
            let secondQuery = "";
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                secondQuery = queryFour;
                productID = '%' + productID + '%';
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
    archiveProductByID = (productID: string, archive: string): Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryOne = "UPDATE ak_products p SET p.archived = ? WHERE p.id = ?;";
            const queryTwo = "UPDATE ak_products p SET p.archived = ? WHERE p.name LIKE ?;";
            const queryThree = "SELECT * FROM ak_products p WHERE p.id = ?;";
            const queryFour = "SELECT * FROM ak_products p WHERE p.name LIKE ?";
            let queryToPerform = "";
            let secondQuery = "";
            const archiveNum = (archive === "true") ? 1 : 0;
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryTwo;
                secondQuery = queryFour;
                productID = '%' + productID + '%';
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
