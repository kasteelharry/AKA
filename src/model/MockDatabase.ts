import { GeneralServerError } from "@dir/exceptions/GeneralServerError";
import { EmptySQLResultError } from "@dir/exceptions/EmptySQLResultError";



const insertResult = {
    fieldCount: 0,
    affectedRows: 1,
    insertId: 3,
    info: '',
    serverStatus: 3,
    warningStatus: 0
};

const insertFailedResult = {
    fieldCount: 0,
    affectedRows: 0,
    insertId: 0,
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

const updateFailedResult = {
    fieldCount: 0,
    affectedRows: 1,
    changedRows: 0,
    insertId: 3,
    info: '',
    serverStatus: 3,
    warningStatus: 0
};

const updateNotFound = {
    fieldCount: 0,
    affectedRows: 0,
    changedRows: 0,
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
        googleId: 112233445566778899,
        session_id: "expiredSession",
    },
    {
        ID: 2,
        Name: 'Bobby',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        loginID: undefined,
        googleId: undefined,
        salt: "testSalt"
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
        session_id: "existentSession",
        salt: "testSalt",
        password: "testHash"
    },
    {
        ID: 3,
        Name: 'Amy',
        BirthDate: new Date("2001-01-26T00:00:00.000Z"),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        Email: 'amy@gmail.com'
    }
    ];

    private dbState: boolean = true;
    private duplicateInsert:boolean = false;
    private indexToUse:number = 0;
    private failInsert: boolean = false;

    setFailInsert(fail: boolean): void {
        this.failInsert = fail;
    }



    setDuplicateInsert(duplicate: boolean):void{
        this.duplicateInsert = duplicate;
    }

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

                try {
                    const param= qry.parameters;
                    switch (qry.query.split(" ")[0]) {
                        case "SELECT":
                            if (param === undefined || param.length === 0) {
                                res[qry.id] = this.getAllElements();
                                break;
                            }
                            const id = param[0];
                            const num = parseInt(id, 10);
                            if (isNaN(num)) {
                                res[qry.id] = this.getElements(id);
                            } else {
                                res[qry.id] = this.getElements(num);
                            }
                            break;
                        case "INSERT":
                            res[qry.id] = this.createElements(param);
                            break;
                        case "UPDATE":
                            const updateNum = parseInt(param[param.length - 1], 10);
                            if (updateNum === undefined || param[1] === undefined) {
                                reject(new GeneralServerError("Bad parameter given"));
                            } else {
                                res[qry.id] = this.updateElements(updateNum, param);
                            }
                            break;
                        case "DELETE":
                            const deleteNum = parseInt(param, 10);
                            if (deleteNum === undefined) {
                                reject(new GeneralServerError("Bad parameter given"));
                            } else {
                                res[qry.id] = this.deleteElements();
                            }
                            break;
                        default:
                            reject(new GeneralServerError("SQL Query wasn't recognized."));
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
        if (this.indexToUse === 3) {
            throw new EmptySQLResultError("Could not delete");
        }
        return {
            result: updateResult
        };
    }


    updateElements(id: number, param: (string | number | null | undefined)[]): any {

        if (this.indexToUse === 1) {
            return {
                result: updateFailedResult,
            };
        } else if (this.indexToUse === 2) {
            return {
                result: updateNotFound,
            };
        } else {
            return {
            result: updateResult,
        };
        }

    }

    createElements(param: string[]): any {
        if (param === undefined || param.length === 0 ) {
            return {
                result: insertFailedResult,
            };
        } else if (this.duplicateInsert) {
            throw new GeneralServerError("Duplicate entry found for insert");
        } else if (this.failInsert === true) {
            throw new GeneralServerError("Could not insert.");
        }
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
            const values = this.itemList.filter(e =>e.Name === index || e.Email === index || e.Bankaccount === index || e.session_id === index);
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