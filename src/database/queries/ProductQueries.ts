import { RowDataPacket } from "mysql2";
import { UnexpectedSQLResultError } from "../../exceptions/UnexpectedSQLResultError";
import { EmptySQLResultError } from "../../exceptions/EmptySQLResultError";
import { BasicProduct, Product } from "../../model/Products";
import { db } from "../Database";

export const getAllProducts = (callback: Function) => {
    const query = "SELECT * FROM ak_products";

    db.query(query, (err, result) => {
        if (err) {callback(err)}
        let resultArr: BasicProduct[] = [];
        const rows = <RowDataPacket[]> result;
        rows.forEach(row => {
            const product: Product = {
                id: row.ID,
                name: row.Name,
                archived: row.Archived
            }
            resultArr.push(product);
        });
        callback(null, resultArr);
    });
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
        query = queryOne
    }
    db.query(query, productID, (err, result) => {
        try {
            if (err) {
                callback(err);
            }
            const rows = <RowDataPacket[]> result;
            if (rows == undefined) {
                throw new EmptySQLResultError("No match found.");
            } else if (rows.length == 1) {
                rows.forEach(row => {
                    const product: Product = {
                        id: row.ID,
                        name: row.Name,
                        archived: row.Archived
                    }
                    callback(null, product);
                });
            } else {
                throw new UnexpectedSQLResultError("Expected 1 result, received " + rows.length);
            }
        } catch (error) {
            callback(error);
        }
    });
}