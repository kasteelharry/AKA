
import { executePreparedQuery } from "../Database";


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
export const getAllProducts = (callback: Function) => {
    const query = "SELECT * FROM ak_products";
    executePreparedQuery(query, callback);
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



// 
// ------------------------- Delete statements -------------------------
// 