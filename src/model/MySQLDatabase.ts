import mysql from 'mysql2';
import dotenv from 'dotenv';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { UnexpectedSQLResultError } from '@dir/exceptions/UnexpectedSQLResultError';
dotenv.config();
const hostname = process.env.DATABASE_HOST;
const database = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;

export default class MySqlDatabase<T> implements Database<T> {

    setDBState(state:boolean): void {
        throw new Error("Method not implemented.");
    }

    private dbState: boolean = true;

    options = {
        connectionLimit: 10,
        host: hostname,
        user: username,
        password,
        database,
        port: 3306,
        timezone: 'Europe/Amsterdam'
    };

    db:mysql.Pool = mysql.createPool(this.options);


    public get getdb() : mysql.Pool {
        return this.db;
    }


    create(object: T): Promise<void> {
        throw new Error("Method not implemented.");
    }
    get(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
    getAll(): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    update(id: string, object: T): Promise<void> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }


    executeTransactions(queries: { id: number,
                                query: string,
                                parameters: (string | number | boolean | JSON | Date | null | undefined)[]}[]): Promise<{ [id: string]: any }> {
        return new Promise(async (resolve, reject) => {
            const results: {[id: string]: {result: any} }= {};
            this.db.getConnection((err, connection) => {
                connection.beginTransaction((error) => {
                    if (error) {
                        connection.rollback(() => {
                            connection.release();
                            reject(new UnexpectedSQLResultError("Something went wrong with the connection."));
                        });
                    }
                    for (const query of queries) {
                        connection.query(query.query, query.parameters, (err1, queryResult, fields) => {
                            // If the query errored, then rollback and reject
                            if (err1) {
                                // Try catch the rollback end reject if the rollback fails
                                try {
                                    connection.rollback(() => {
                                        connection.release();
                                        reject(new UnexpectedSQLResultError("Something went wrong with query " + query.id + "."));
                                    });
                                } catch (rollbackError) {
                                    connection.release();
                                    reject(new UnexpectedSQLResultError("Failed to roll back."));
                                }
                            }
                            if(queryResult === undefined) {
                                connection.rollback(() => {
                                connection.release();
                                });
                                // If the server has thrown a SQL error, catch it here otherwise nothing was found.
                                if (err) {
                                    reject(new ItemAlreadyExistsError(err.message));
                                } else {
                                    reject(new UnexpectedSQLResultError("No match found."));
                                }
                            }
                            // Push the result into an array and index it with the ID passed for searching later
                            results[query.id] = {
                                result: queryResult,
                            };
                        });
                    }
                    connection.commit((commitError) => {
                        if (commitError) {
                            connection.rollback(() => {
                            connection.release();
                            reject(new UnexpectedSQLResultError("Something went wrong with the query."));
                            });
                        }
                        resolve(results);
                        connection.release();
                    });
                });
            });
        });
    }


}