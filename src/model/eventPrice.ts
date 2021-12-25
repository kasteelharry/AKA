import { BasicEvent } from "./Event";
import { BasicProduct } from "./products";

export interface EventPrice {
    eventID: BasicEvent
    productID: BasicProduct
    price: number
}