import { BasicEvent } from "./Event";
import { BasicProduct } from "./Products";

export interface EventPrice {
    eventID: BasicEvent;
    productID: BasicProduct;
    price: number;
}