import { ItemAlreadyExistsError } from "../exceptions/ItemAlreadyExistsError";
import { GeneralServerError } from "../exceptions/GeneralServerError";
import { EmptySQLResultError } from "../exceptions/EmptySQLResultError";
import { isDeepStrictEqual } from "util";
import { query } from "express";

export const exampleResult = {
    '1': {
        result: [
            {
                ID: 1,
                Name: 'Joris',
                BirthDate: new Date("2001-01-26T00:00:00.000Z"),
                PicturePath: null,
                Bankaccount: 'NL22INGB0123456789',
                Active: 1
            },
            {
                ID: 2,
                Name: 'Bobby',
                BirthDate: new Date("2001-01-26T00:00:00.000Z"),
                PicturePath: null,
                Bankaccount: 'NL22INGB0123456789',
                Active: 1
            }
        ]
    }
};

const insertResult = {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 3,
    info: '',
    serverStatus: 3,
    warningStatus: 0
};

const updateResult = {
    fieldCount: 0,
    affectedRows: 1,
    changedRows: 1,
    insertId: 3,
    info: '',
    serverStatus: 3,
    warningStatus: 0
};

export class MockDatabase<T> implements Database<T> {

    itemList = [{
        ID: 1,
        Name: 'Joris',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1
    },
    {
        ID: 2,
        Name: 'Bobby',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1
    },
    ];

    private dbState: boolean = true;


    setDBState(state: boolean): void {
        this.dbState = state;
    }

    executeTransactions(queries: any[]): Promise<{ [id: string]: any }> {
        return new Promise((resolve, reject) => {
            if (!this.dbState) {
                reject(new GeneralServerError("SQL Server is not able to be reached"));
            }
            let res: { [id: string]: { result: any } } = {};
            for (const qry of queries) {
                try {
                    switch (qry.query.split(" ")[0]) {
                        case "SELECT":
                            if (qry.parameters[0] === undefined) {
                                res[qry.id] = this.getAllElements();
                                break;
                            }
                            const num = parseInt(qry.parameters[0], 10);
                            if (num === undefined) {
                                reject(new GeneralServerError("Bad parameter given"));
                            } else {
                                res[qry.id] = this.getElements(num);
                            }
                            break;
                        case "INSERT":
                            res[qry.id] = this.createElements(qry.parameters);
                            break;
                        case "UPDATE":
                            const updateNum = parseInt(qry.parameters[0], 10);
                            const map:Map<string, string | number | undefined> = qry.parameters[1];
                            if (updateNum === undefined || qry.parameters[1] === undefined) {
                                reject(new GeneralServerError("Bad parameter given"));
                            } else {
                                res[qry.id] = this.updateElements(updateNum, map);
                            }
                            break;
                        case "DELETE":
                            const deleteNum = parseInt(qry.parameters[0], 10);
                            if (deleteNum === undefined) {
                                reject(new GeneralServerError("Bad parameter given"));
                            } else {
                                res[qry.id] = this.deleteElements();
                            }
                            break;
                        default:
                            reject(new GeneralServerError("SQL Server is not able to be reached"));
                            break;
                    }
                    if (qry.id === queries.length){
                        resolve(res);
                        return;
                    }
                } catch (error) {
                    reject(error);
                }

            }
        });
    }

    deleteElements() {
        return {
            result: updateResult
        };
    }


    updateElements(id:number, param: Map<string, string | number | undefined>):any {

        return {
            result: updateResult,
        };
    }

    createElements(param: string[]): any {
        return {
            result: insertResult,
        };
    }

    getAllElements(): any {
        return {
            result: this.itemList
        };
    }

    getElements(index: number): any {
        if (this.itemList.length <= index) {
            throw new EmptySQLResultError("No results found.");
        }
        return {
            result: this.itemList,
        };
    }

    private objects: any[] = [];

    async create(object: T): Promise<void> {
        this.objects.push(object);
    }

    async get(id: string): Promise<T> {
        return this.objects.find(o => o.id === id);
    }

    async getAll(): Promise<T[]> {
        return this.objects;
    }

    update(id: string, object: T): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}