import { BasicSale } from "./sale";
import { BasicUser } from "./users";

export interface UserSale {
    saleID: BasicSale
    userID: BasicUser
    totalPrice: number
}