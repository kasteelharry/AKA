import mysql, { FieldPacket } from 'mysql2';
import dotenv from 'dotenv';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';
import { UnexpectedSQLResultError } from '../exceptions/UnexpectedSQLResultError';

dotenv.config();

const hostname = process.env.DATABASE_HOST;
const database = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;

export const dbSessionOptions = {
    host: hostname,
    user: username,
    password,
    database,
    port: 3306,
    schema: {
        tableName: 'ak_session',
        columnNames: {
          session_id: 'session_id',
          expires: 'expires',
          data: 'data'
        }
      },
      clearExpired: true,
      checkExpirationInterval: 60000, // 1 minute
};

const options = {
    connectionLimit: 10,
    host: hostname,
    user: username,
    password,
    database,
    port: 3306,
    timezone: 'Europe/Amsterdam'
};

async function getPool(option = {}) {
    return await mysql.createPool(options);
  }

export const db = getPool();

/**
 * Performs a transactions of all the queries passed in the database.
 * @param queries the queries to perform with their attributes.
 * @returns an overview of the results or the error.
 */
export const executeTransactions = async (queries: { id: number, query: string, parameters: (string | number | boolean | JSON | Date | null | undefined)[]}[]): Promise<{ [id: string]: any }> => {
    return new Promise(async (resolve, reject) => {
        const results: {[id: string]: {result: any, fields: FieldPacket[] | undefined} }= {};
        (await db).getConnection((err, connection) => {
            connection.beginTransaction((error) => {
                if (err) {
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
                            fields,
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
};

console.log(`connecting to database ${database} on ${hostname}`);