import { BasicEvent } from "./event";

export interface Flowstand {
    eventID: BasicEvent;
    start?: number;
    end?: number;
}