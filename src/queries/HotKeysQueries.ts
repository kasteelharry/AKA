import { queryType } from '@dir/app';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';

export default class HotKeyQueries {
    constructor (private database: Database<queryType>) {
        this.database = database;
    }

    //
    // ------------------------- Create statements -------------------------
    //
    /**
     * Sets a new hotkey for a product. If the product already has a hotkey or the hotkey has
     * already been taken, the promise will rejected with an error.
     * @param product - The name or ID of the product.
     * @param hotkey - The hotkey that will be set.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    createNewHotKey = (product:string, hotkey:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'INSERT INTO ak_hotkeys (ProductID, Hotkey) ' +
            'VALUES(?, ?)';
            const queryB = 'INSERT INTO ak_hotkeys (ProductID, Hotkey) ' +
            'VALUES((SELECT p.ID FROM ak_products WHERE p.name = ?), ?)';
            let query = '';
            const productNum = parseInt(product, 10);
            if (isNaN(productNum)) {
                query = queryB;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [product, hotkey]
                }
            ]).then(
                val => {
                    resolve(val[1].result.insertId);
                }).catch(
                err => {
                    if (err.message.match('Duplicate entry')) {
                        reject(new ItemAlreadyExistsError('Given product ' + product + ' already exists.'));
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
     * Retrieves all the hotkeys from the database.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getAllHotkeys = ():Promise<any> => {
        return new Promise((resolve, reject) => {
            const query = 'SELECT h.productID, p.name, h.hotkey FROM ak_hotkeys h ' +
            'LEFT JOIN ak_products p ' +
            'ON h.productID = p.id;';
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
     * Retrieves the hotkey for a single product from the database.
     * @param productID - The ID or name of the product
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    getHotkeyByProduct = (productID:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'SELECT h.productID, p.name, h.hotkey FROM ak_hotkeys h ' +
            'LEFT JOIN ak_products p ' +
            'ON h.productID = p.id ' +
            'WHERE h.ProductID = ?';
            const queryB = 'SELECT h.productID, p.name, h.hotkey FROM ak_hotkeys h ' +
            'LEFT JOIN ak_products p ' +
            'ON h.productID = p.id ' +
            'WHERE p.name = ?';
            let queryToPerform = '';
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                queryToPerform = queryB;
            } else {
                queryToPerform = queryA;
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
     * Updates the hotkey for a product in the database.
     * @param productID - The name or ID of the product.
     * @param Hotkey - The new hotkey for the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    updateHotkey = (productID:string, Hotkey:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'UPDATE ak_hotkeys h SET h.hotkey = ? WHERE h.productID = ?';
            const queryB = 'UPDATE ak_hotkeys h SET h.hotkey = ? WHERE h.productID = ' +
            '(SELECT p.ID FROM ak_products p WHERE p.name = ?)';
            const queryC = 'SELECT h.productID, p.name, h.hotkey FROM ak_hotkeys h ' +
            'LEFT JOIN ak_products p ' +
            'ON h.productID = p.id ' +
            'WHERE h.ProductID = ?';
            const queryD = 'SELECT h.productID, p.name, h.hotkey FROM ak_hotkeys h ' +
            'LEFT JOIN ak_products p ' +
            'ON h.productID = p.id ' +
            'WHERE p.name = ?';
            let query = '';
            let secondQuery = '';
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                query = queryB;
                secondQuery = queryD;
            } else {
                query = queryA;
                secondQuery = queryC;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
                    parameters: [Hotkey, productID]
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
     * Deletes a hotkey from the database.
     * @param productID - the ID or name of the product.
     * @returns - The Promise object containing the resolved result or the rejected failure.
     */
    deleteHotkey = (productID:string):Promise<any> => {
        return new Promise((resolve, reject) => {
            const queryA = 'DELETE FROM ak_hotkeys h WHERE h.productID = ?';
            const queryB = 'DELETE FROM ak_hotkeys h WHERE h.productID = ' +
            '(SELECT p.id FROM ak_products p WHERE p.name = ?)';
            let query = '';
            const numberID = parseInt(productID, 10);
            if (isNaN(numberID)) {
                query = queryB;
            } else {
                query = queryA;
            }
            this.database.executeTransactions([
                {
                    id: 1,
                    query,
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
}
