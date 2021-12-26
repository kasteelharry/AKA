import { BasicEvent } from "./Event"

export interface TapLoss {
    eventID: BasicEvent;
    used?: number;
    sold?: number;
}