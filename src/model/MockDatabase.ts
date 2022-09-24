/* eslint-disable no-case-declarations */
/* eslint-disable no-loss-of-precision */
import { GeneralServerError } from '@dir/exceptions/GeneralServerError';
import { EmptySQLResultError } from '@dir/exceptions/EmptySQLResultError';
import { convertStringToSQLDate } from '@dir/util/ConvertStringToSQLDate';

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

/**
 * A mock database that emulates the SQL database with certain conditions
 * that ensures every condition can be tested.
 * The data is faked and hardcoded. Thus this does not test the SQL queries.
 */
export class MockDatabase<T> implements Database<T> {
// This is faked data from the database. The real database does not
// generate this data. The data below is data from all tables that
// are being tested, hacked together.
    itemList = [{
        ID: 1,
        Name: 'Joris',
        Email: 'joriskuiper2@gmail.com',
        BirthDate: new Date('2001-01-26T00:00:00.000Z'),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        expires: 1672441200,
        loginID: 112233445566778899,
        googleId: 112233445566778899,
        session_id: 'expiredSession'
    },
    {
        ID: 2,
        Name: 'Bobby',
        BirthDate: new Date('2001-01-26T00:00:00.000Z'),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        loginID: undefined,
        googleId: undefined,
        salt: 'testSalt'
    },
    {
        ID: 3,
        Name: 'Charlie',
        BirthDate: new Date('2001-01-26T00:00:00.000Z'),
        PicturePath: null,
        Bankaccount: 'NL22INGB0123456789',
        Active: 1,
        Email: 'charlie@gmail.com',
        expires: 1670441,
        loginID: 112233445566778899,
        googleId: 112233445566778899,
        session_id: 'existentSession',
        salt: 'testSalt',
        password: 'testHash',
        timestamp: convertStringToSQLDate('2000-12-12')
    },
    {
        ID: 3,
        Name: 'Amy',
        BirthDate: new Date('2001-01-26T00:00:00.000Z'),
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

    setFailInsert (fail: boolean): void {
        this.failInsert = fail;
    }

    setDuplicateInsert (duplicate: boolean):void {
        this.duplicateInsert = duplicate;
    }

    setDBState (state: boolean): void {
        this.dbState = state;
    }

    setIndexToUse (index:number): void {
        this.indexToUse = index;
    }

    getDBState ():boolean {
        return this.dbState;
    }

    getDuplicateInsert ():boolean {
        return this.duplicateInsert;
    }

    getFailInsert ():boolean {
        return this.failInsert;
    }

    getIndexToUse ():number {
        return this.indexToUse;
    }

    executeTransactions (queries: any[]): Promise<{ [id: string]: any }> {
        return new Promise((resolve, reject) => {
            if (!this.dbState) {
                reject(new GeneralServerError('SQL Server is not able to be reached'));
            }
            const res: { [id: string]: { result: any } } = {};
            for (const qry of queries) {
                try {
                    const param = qry.parameters;
                    switch (qry.query.split(' ')[0]) {
                    case 'SELECT':
                        if (param === undefined || param.length === 0) {
                            res[qry.id] = this.getAllElements();
                            break;
                        }
                        const id:string|number = param[0];
                        let num;
                        let bool = false;
                        if (typeof id === 'number') {
                            num = id;
                        } else {
                            num = parseInt(id, 10);
                            if (id.match(':')) {
                                bool = true;
                            }
                        }
                        if (isNaN(num) || bool) {
                            const ts = convertStringToSQLDate(id);
                            if (ts !== undefined) {
                                res[qry.id] = this.getElements(ts);
                            } else {
                                res[qry.id] = this.getElements(id);
                            }
                        } else {
                            res[qry.id] = this.getElements(num);
                        }
                        break;
                    case 'INSERT':
                        res[qry.id] = this.createElements(param);
                        break;
                    case 'UPDATE':
                        res[qry.id] = this.updateElements(param[param.length - 1], param);
                        break;
                    case 'DELETE':
                        res[qry.id] = this.deleteElements();
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

    deleteElements () {
        if (this.indexToUse === 3) {
            throw new EmptySQLResultError('Could not delete');
        } else if (this.indexToUse === 2) {
            return {
                result: updateNotFound
            };
        }
        return {
            result: updateResult
        };
    }

    updateElements (id: number, param: (string | number | null | undefined)[]): any {
        if (this.indexToUse === 1) {
            return {
                result: updateFailedResult
            };
        } else if (this.indexToUse === 2) {
            return {
                result: updateNotFound
            };
        } else {
            return {
                result: updateResult
            };
        }
    }

    createElements (param: string[]): any {
        if (param === undefined || param.length === 0) {
            return {
                result: insertFailedResult
            };
        } else if (this.duplicateInsert) {
            throw new GeneralServerError('Duplicate entry found for insert');
        } else if (this.failInsert === true) {
            throw new GeneralServerError('Could not insert.');
        }
        return {
            result: insertResult
        };
    }

    getAllElements (): any {
        return {
            result: this.itemList
        };
    }

    getElements (index: number | string): any {
        if (typeof index === 'string') {
            const values = this.itemList.filter(e => e.Name === index || e.Email === index || e.Bankaccount === index || e.session_id === index || e.timestamp === index);
            return {
                result: values
            };
        }
        if (this.itemList.length <= index) {
            throw new EmptySQLResultError('No results found.');
        }
        return {
            result: [this.itemList[this.indexToUse]]
        };
    }
}
