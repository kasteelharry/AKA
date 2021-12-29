import mysql, { FieldPacket, PoolConnection } from 'mysql2';
import dotenv from 'dotenv';
import { ItemAlreadyExistsError } from '../exceptions/ItemAlreadyExistsError';
import { UnexpectedSQLResultError } from '../exceptions/UnexpectedSQLResultError';

dotenv.config();

const hostname = process.env.DATABASE_HOST;
const database = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;
export const db = mysql.createPool({
    connectionLimit: 10,
    host: hostname,
    user: username,
    password: password,
    database: database,
    port: 3306,
    timezone: 'Europe/Amsterdam'
});


export const executeTransactions = async (queries: Array<{ id: number, query: string, parameters: Array<string | number | boolean | JSON> }>): Promise<{ [id: string]: any }> => {
    return new Promise(async (resolve, reject) => {
        const results: {[id: string]: {result: any, fields: FieldPacket[] | undefined} }= {};
        db.getConnection((err, connection) => {
            connection.beginTransaction((err) => {
                if (err) {
                    connection.rollback(() => {
                        connection.release();
                        reject(new UnexpectedSQLResultError("Something went wrong with the connection."))
                    });
                }
                for (const query of queries) {
                    connection.query(query.query, query.parameters, (err, queryResult, fields) => {
                        // If the query errored, then rollback and reject
                        if (err) {
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
                        
                        if(queryResult == undefined) {
                            connection.release();
                            reject(new UnexpectedSQLResultError('No result found'))
                        }
                        // Push the result into an array and index it with the ID passed for searching later
                        results[query.id] = {
                            result: queryResult,
                            fields: fields,
                        };
                    });
                }
            
                connection.commit((commitError) => {
                    if (commitError) {
                        connection.release();
                        reject(new UnexpectedSQLResultError("Something went wrong with the query."));
                    }
                    resolve(results);
                });
            });
        
        });
    
    });
}


export const executePreparedQuery = (query: string, callback: Function, param?: any) => {
    db.getConnection((err, connection) => {
        try {
            connection.on("error", (error: Error) => {
                if (error.message.match('Duplicate entry')) {
                    callback(new ItemAlreadyExistsError())
                } else {
                    callback(new UnexpectedSQLResultError("Something went wrong with the connection."))
                }
                return
            })
        } catch (error) {
            callback(new UnexpectedSQLResultError("Something went wrong with the database."));
            return;
        }
        
        
        connection.beginTransaction((err) => {
            if (err) {
                connection.rollback(() => {
                    connection.release();
                    connection.emit('error', err);
                });
            } else {
                connection.query(query, param, (err, result) => {
                    if (err) {
                        connection.rollback(() => {
                            connection.release();
                            connection.emit('error', err);
                        });

                    } else {
                        connection.commit((err) => {
                            if (err) {
                                connection.rollback(() => {
                                    connection.release();
                                    connection.emit('error', err);
                                });
                            } else if (result == undefined) {
                                connection.rollback(() => {
                                    connection.release();
                                    connection.emit('error', err);
                                });
                            } else {
                                connection.release();

                            }
                        });
                        callback(null, result)
                    }
                });
            }
        });
    });
}

console.log(`connecting to database ${database} on ${hostname}`);

