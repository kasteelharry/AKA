import mysql from 'mysql2';
import dotenv from 'dotenv';
import { ItemAlreadyExistsError } from '@dir/exceptions/ItemAlreadyExistsError';
import { UnexpectedSQLResultError } from '@dir/exceptions/UnexpectedSQLResultError';
dotenv.config();
const hostname = process.env.DATABASE_HOST;
const database = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;
// const limit = process.env.DATABASE_LIMIT;

/**
 * The MySQL database model. This class handles pool creation, queries and transactions
 * It is connected with a MySQL database. It is not tested by unit tests as of this moment,
 * thus behaviour could sometimes be unexpected.
 */
export default class MySqlDatabase<T> implements Database<T> {
    private db:mysql.Pool;
    constructor () {
        this.db = mysql.createPool(this.options);
    }

    options = {
        connectionLimit: 10,
        host: hostname,
        user: username,
        password,
        database,
        port: 3306,
        timezone: 'Europe/Amsterdam'
    };

    /**
     * Performs a transaction of one or multiple queries on the database. A connection will be
     * retrieved from the connection pool that was setup and this connection will be utilized
     * to perform the queries. If the transaction was successful, the returned {@link Promise}
     * will contain the results of the query. If the transaction failed, the {@link Promise} will
     * contain the error that was thrown.
     *
     * @remarks
     * This method is not covered by unit tests. This might be changed in a future version of
     * the API. However for now this method could result in unexpected behaviour or non-descriptive
     * errors that are a catch-all in the event anything goes wrong.
     *
     * @param queries - the queries to execute. The queries are in a object type array where each query
     * in the array is of the form:
     * ```typescript
     * {
     *      id:number,
     *      query:string,
     *      parameters:(string | number | boolean | JSON | Date | null | undefined)[]
     * }
     * ```
     * @returns The {@link Promise} object holding either the failure or the success.
     *
     */
    executeTransactions (queries: { id: number,
                                query: string,
                                parameters: (string | number | boolean | JSON | Date | null | undefined)[]}[]): Promise<{ [id: string]: any }> {
        return new Promise(async (resolve, reject) => {
            const results: {[id: string]: {result: any} } = {};
            this.db.getConnection((err, connection) => {
                connection.beginTransaction((error) => {
                    if (error) {
                        connection.rollback(() => {
                            connection.release();
                            reject(new UnexpectedSQLResultError('Something went wrong with the connection.'));
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
                                        reject(new UnexpectedSQLResultError('Something went wrong with query ' + query.id + '.'));
                                    });
                                } catch (rollbackError) {
                                    connection.release();
                                    reject(new UnexpectedSQLResultError('Failed to roll back.'));
                                }
                            }
                            if (queryResult === undefined) {
                                connection.rollback(() => {
                                    connection.release();
                                });
                                // If the server has thrown a SQL error, catch it here otherwise nothing was found.
                                if (err) {
                                    reject(new ItemAlreadyExistsError(err.message));
                                } else {
                                    reject(new UnexpectedSQLResultError('No match found.'));
                                }
                            }
                            // Push the result into an array and index it with the ID passed for searching later
                            results[query.id] = {
                                result: queryResult
                            };
                        });
                    }
                    connection.commit((commitError) => {
                        if (commitError) {
                            connection.rollback(() => {
                                connection.release();
                                reject(new UnexpectedSQLResultError('Something went wrong with the query.'));
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
