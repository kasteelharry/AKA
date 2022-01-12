import https from 'https';
import fs from 'fs';
import path from 'path';
import {appExport as app} from './app';
import session from 'express-session';
// tslint:disable-next-line: no-var-requires
const MySQLStore = require('express-mysql-session')(session);

const hostname = process.env.DATABASE_HOST;
const dbSchema = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;

const options = {
    key: fs.readFileSync(path.join(__dirname, "../.keys/privkey.pem"), "utf-8"),
    cert: fs.readFileSync(path.join(__dirname, "../.keys/fullchain.pem"), "utf-8")
};

const dbSessionOptions = {
    host: hostname,
    user: username,
    password,
    database: dbSchema,
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

const sessionStore = new MySQLStore(dbSessionOptions);

const secretKey: string = process.env.SESSION_SECRET === undefined ? "THISISABACKUPSESSION" : process.env.SESSION_SECRET;
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    // TODO set this to secure
    cookie: {
        secure: true,
        maxAge: 1000 * 12 * 60 * 60,// 12 hours expiration rate
        sameSite: true
    }
}));


https.createServer(options, app).listen(process.env.PORT_HTTPS);