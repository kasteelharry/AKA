import { NewProduct } from "../../model/Products";
import { executePreparedQuery } from "../Database";

export const createNewProduct = (product: NewProduct, callback: Function) => {
    const query = "INSERT INTO ak_products (Name) VALUES (?);";
    executePreparedQuery(query, callback, product.name);
}

export const getAllProducts = (callback: Function) => {
    const query = "SELECT * FROM ak_products";
    executePreparedQuery(query, callback);
}

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