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



export class MockDatabase<T> implements Database<T> {

    table = {};

    private dbState: boolean = true;


    setDBState(state:boolean): void {
        this.dbState = state;
    }

    executeTransactions(queries: any[]): Promise<{ [id: string]: any }> {
        return new Promise((resolve, reject) => {
            if (!this.dbState) {
                reject(new GeneralServerError("SQL Server is not able to be reached"));
            }
            const queryList:[{query:string, param:string[]}] = [{query:"", param:[]}];
            queryList.pop();
            for (const qry of queries) {
                queryList.push({
                    query: qry.query,
                    param: qry.param
                });
            }

            const firstQ = queryList[0].query;
            if (firstQ.startsWith("SELECT")) {
                resolve(this.getAllElements());
            } else {
                reject(new GeneralServerError("SQL Server is not able to be reached"));
            }

        });
    }

    getAllElements():any {
        return exampleResult;
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