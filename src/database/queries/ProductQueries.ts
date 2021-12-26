import { RowDataPacket } from "mysql2";
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