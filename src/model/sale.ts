import { BasicEvent } from "./Event"
import { BasicProduct } from "./Products"

export interface BasicSale {
    eventID: BasicEvent;
    productID: BasicProduct;
    timeSold: Date;
    amount: number;
    
}

export interface Sale extends BasicSale {
    id: number;
}