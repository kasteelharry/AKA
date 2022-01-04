import { ItemAlreadyExistsError } from "../exceptions/ItemAlreadyExistsError";
import { GeneralServerError } from "../exceptions/GeneralServerError";

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

export const singleResult = {
    '1': {
        result: [
            {
                ID: 1,
                Name: 'Joris',
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


export class MockDatabase<T> implements Database<T> {

    table: string[][] = [];

    private dbState: boolean = true;


    setDBState(state: boolean): void {
        this.dbState = state;
    }

    executeTransactions(queries: any[]): Promise<{ [id: string]: any }> {
        return new Promise((resolve, reject) => {
            if (!this.dbState) {
                reject(new GeneralServerError("SQL Server is not able to be reached"));
            }
            const queryList: [{ query: string, param: string[] }] = [{ query: "", param: [] }];
            queryList.pop();
            for (const qry of queries) {
                queryList.push({
                    query: qry.query,
                    param: qry.parameters
                });
            }

            const firstQ = queryList[0].query;
            const firstP = queryList[0].param;
            try {
                let res;
                switch (firstQ.split(" ")[0]) {
                    case "SELECT":
                        if (firstP[0] === undefined) {
                            resolve(this.getAllElements());
                        } else {
                            resolve(this.getElements(firstP[0]));
                        }
                        break;
                    case "INSERT":
                        res = this.createElements(firstP);
                        resolve(res);
                        break;
                    default:
                        reject(new GeneralServerError("SQL Server is not able to be reached"));
                        break;
                }
            } catch (error) {
                reject(error);
            }

        });
    }
    createElements(firstP: string[]): any {
        if (this.table.includes(firstP)) {
            throw new ItemAlreadyExistsError();
        }
        const results: { [id: string]: { result: any } } = {};
        results[1] = {
            result: insertResult,
        };
        this.table.push(firstP);
        return results;
    }

    getAllElements(): any {
        return exampleResult;
    }

    getElements(index: string | number): any {
        return singleResult;
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