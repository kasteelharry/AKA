import mysql, { FieldPacket } from 'mysql2';
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


export const executeTransactions = async (queries: Array<{ id: number, query: string, parameters: Array<string | number | boolean | JSON | Date | null | undefined> }>): Promise<{ [id: string]: any }> => {
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
                            connection.rollback(() => {
                            connection.release();
                            
                            });
                            // If the server has thrown a SQL error, catch it here otherwise nothing was found.
                            if (err) {
                                console.log('error found.');
                                
                                reject(new ItemAlreadyExistsError(err.message))
                            } else {
                                reject(new UnexpectedSQLResultError("No match found.")) 
                            }
                            
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

console.log(`connecting to database ${database} on ${hostname}`);

