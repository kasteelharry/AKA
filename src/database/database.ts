import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const hostname = process.env.DATABASE_HOST;
const database = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;
export const db = mysql.createConnection({
    host: hostname, 
    user:username, 
    password: password,
    database: database,
    port: 3306,
    timezone: 'Europe/Amsterdam'
});

console.log(`connecting to database ${database} on ${hostname}`);

