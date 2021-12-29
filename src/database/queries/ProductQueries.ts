
import { FieldPacket } from "mysql2";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";
import { ItemAlreadyExistsError } from "../../exceptions/ItemAlreadyExistsError";
import { executePreparedQuery, executeTransactions } from "../Database";


// 
// ------------------------- Create statements -------------------------
// 

/**
 * Creates a new product with just the name.
 * @param product the name of the product.
 * @param callback callback method containing the result of the query.
 */
export const createNewProduct = (product: string, callback: Function) => {
    const query = "INSERT INTO ak_products (Name) VALUES (?);";
    executePreparedQuery(query, callback, product);
}

// 
// ------------------------- Retrieve statements -------------------------
// 

/**
 * Gets all the products from the database.
 * @param callback callback method containing the result of the query.
 */
export const getAllProducts = async (callback: Function) => {
    const query = "SELECT * FROM ak_products";
    
    // executePreparedQuery(query, callback);
}

export const getProducts = (callback: Function)  => {
    console.log("called");
    
    executeTransactions([
        {
            id: 1,
            query: "SELECT * FROM ak_products",
            parameters: []
        }
    ]).then(
        val => {
            callback(null, val[1].result)
        }).catch(
            err => callback(err)
        );
}

/**
 * Gets a single product from the database.
 * @param productID the product ID, can be the name or the id.
 * @param callback callback method containing the result of the query.
 */
export const getProductByID = (productID:string, callback: Function) => {
    const queryOne = "SELECT * FROM ak_products p WHERE p.id = ?;";
    const queryTwo = "SELECT * FROM ak_products p WHERE p.name LIKE ?";
    let query = "";
    const numberID = parseInt(productID);
    if (isNaN(numberID)) {
        query = queryTwo;
        productID = '%' + productID + '%';
    } else {
        query = queryOne;
    }
    executePreparedQuery(query, callback, productID);
}

// 
// ------------------------- Update statements -------------------------
// 

export const updateProductNameByID = (productID:string, newName:string, callback:Function) => {
    const queryOne = "UPDATE ak_products p SET p.name = ? WHERE p.id = ?;";
    const queryTwo = "UPDATE ak_products p SET p.name = ? WHERE p.name LIKE ?";
    const queryThree = "SELECT * FROM ak_products p WHERE p.id = ?;";
    const queryFour = "SELECT * FROM ak_products p WHERE p.name LIKE ?";
    let queryToPerform = "";
    let secondQuery = "";
    const numberID = parseInt(productID);
    if (isNaN(numberID)) {
        queryToPerform = queryTwo;
        secondQuery = queryFour;
        productID = '%' + productID + '%';
    } else {
        queryToPerform = queryOne;
        secondQuery = queryThree;
    }
    // executePreparedQuery(query, callback, [newName, productID]);
    executeTransactions([
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
            const queryResults = val[1].result
            if (queryResults.changedRows == 1) {
                callback(null, val[2].result);
            } else if (queryResults.affectedRows == 1) {
                callback(new ItemAlreadyExistsError());
            } else {
                callback(new EmptySQLResultError('Was unable to find a match for the id.'))
            }
            
        }).catch(
            err => callback(err)
        );
}

export const archiveProductByID = (productID:string, archive:string, callback:Function) => {
    const queryOne = "UPDATE ak_products p SET p.archived = ? WHERE p.id = ?;";
    const queryTwo = "UPDATE ak_products p SET p.archived = ? WHERE p.name LIKE ?;";
    const queryThree = "SELECT * FROM ak_products p WHERE p.id = ?;";
    const queryFour = "SELECT * FROM ak_products p WHERE p.name LIKE ?";
    let queryToPerform = "";
    let secondQuery = "";
    const archiveNum = (archive =="true") ? 1 : 0;
    const numberID = parseInt(productID);
    if (isNaN(numberID)) {
        queryToPerform = queryTwo;
        secondQuery = queryFour;
        productID = '%' + productID + '%';
    } else {
        queryToPerform = queryOne;
        secondQuery = queryThree;
    }
    executeTransactions([
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
            
            if (queryResults.changedRows == 1) {
                callback(null, val[2].result);
            } else if (queryResults.affectedRows == 1) {
                callback(new ItemAlreadyExistsError());
            } else {
                callback(new EmptySQLResultError('Was unable to find a match for the id.'));
            }
            
        }).catch(
            err => callback(err)
        );
}

// 
// ------------------------- Delete statements -------------------------
// 

export const deleteProductNameByID = (productId:string, callback:Function) => {
    const queryOne = "DELETE FROM ak_products p WHERE p.id = ?;";
    const queryTwo = "DELETE FROM ak_products p WHERE p.name LIKE ?";
    let query = "";
    const numberID = parseInt(productId);
    if (isNaN(numberID)) {
        query = queryTwo;
        productId = '%' + productId + '%';
    } else {
        query = queryOne;
    }
    executePreparedQuery(query, callback, productId);
}