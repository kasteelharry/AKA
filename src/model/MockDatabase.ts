import { ItemAlreadyExistsError } from "../exceptions/ItemAlreadyExistsError";
import { GeneralServerError } from "../exceptions/GeneralServerError";
import { EmptySQLResultError } from "../exceptions/EmptySQLResultError";
import { isDeepStrictEqual } from "util";
import { query } from "express";



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
// This is faked data from the database. The real database does not
// generate this data. The data below is data from all tables that
// are being tested, hacked together.
    itemList = [{
        ID: 1,
        Name: 'Joris',
        Email: 'joriskuiper2@gmail.com',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        expires: 1672441200,
        loginID: 112233445566778899,
        googleId: 112233445566778899
    },
    {
        ID: 2,
        Name: 'Bobby',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1
    },
    {
        ID: 3,
        Name: 'Charlie',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        Email: 'charlie@gmail.com',
        expires: 1670441,
        loginID: 112233445566778899,
        googleId: 112233445566778899,
    },
    ];

    private dbState: boolean = true;

    private indexToUse:number = 0;

    setDBState(state: boolean): void {
        this.dbState = state;
    }

    setIndexToUse(index:number): void {
        this.indexToUse = index;
    }

    executeTransactions(queries: any[]): Promise<{ [id: string]: any }> {
        return new Promise((resolve, reject) => {
            if (!this.dbState) {
                reject(new GeneralServerError("SQL Server is not able to be reached"));
            }
            const res: { [id: string]: { result: any } } = {};
            for (const qry of queries) {
                const param = qry.parameters;
                try {
                    switch (qry.query.split(" ")[0]) {
                        case "SELECT":
                            if (param[0] === undefined) {
                                res[qry.id] = this.getAllElements();
                                break;
                            }
                            const num = parseInt(param[0], 10);
                            if (num === undefined) {
                                res[qry.id] = this.getElements(param[0]);
                            } else {
                                res[qry.id] = this.getElements(num);
                            }
                            break;
                        case "INSERT":
                            res[qry.id] = this.createElements(param);
                            break;
                        case "UPDATE":
                            const updateNum = parseInt(param[0], 10);
                            const map: Map<string, string | number | undefined> = param[1];
                            if (updateNum === undefined || param[1] === undefined) {
                                reject(new GeneralServerError("Bad parameter given"));
                            } else {
                                res[qry.id] = this.updateElements(updateNum, map);
                            }
                            break;
                        case "DELETE":
                            const deleteNum = parseInt(param[0], 10);
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
                    if (qry.id === queries.length) {
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


    updateElements(id: number, param: Map<string, string | number | undefined>): any {

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

    getElements(index: number | string): any {
        if (typeof index === 'string' ) {
            const values = this.itemList.filter(e =>e.Name === index || e.Email === index || e.Bankaccount === index);
            return {
                result:values,
            };
        }
        if (this.itemList.length <= index) {
            throw new EmptySQLResultError("No results found.");
        }
        return {
            result: [this.itemList[this.indexToUse]],
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