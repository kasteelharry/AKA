import { EventType } from "./eventTypes"

export interface BasicEvent {
    id: number
}

export interface Event extends BasicEvent {
    name: string
    eventType?: EventType
    startDate?: Date
    endDate?: Date
    saved?:boolean
}