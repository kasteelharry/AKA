import { BasicSale } from "./Sale";
import { BasicUser } from "./Users";

export interface UserSale {
    saleID: BasicSale;
    userID: BasicUser;
    totalPrice: number;
}