import 'module-alias/register';
import express, { NextFunction, Request, Response } from 'express';

import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from '@dir/routes/Index';
import loginRouter from '@dir/routes/Login';
import apiRouter from '@dir/routes/apiRoutes';
import https from 'https';
import fs from 'fs';
import session from 'express-session';
import dotenv from 'dotenv';
import MySQLDatabase from '@dir/model/MySQLDatabase';
import UserAuthentication from '@dir/util/UserAuthentication';
import { MockDatabase } from './model/MockDatabase';

const app = express();

dotenv.config();
// tslint:disable-next-line: no-var-requires
const MySQLStore = require('express-mysql-session')(session);

const hostname = process.env.DATABASE_HOST;
const dbSchema = process.env.DATABASE_SCHEMA;
const password = process.env.DATABASE_PASSWORD;
const username = process.env.DATABASE_USER;

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
    clearExpired: false,
    checkExpirationInterval: 60000 // 1 minute
};

const sessionStore = new MySQLStore(dbSessionOptions);
console.log(sessionStore);

const secretKey: string = process.env.SESSION_SECRET === undefined ? 'THISISABACKUPSESSION' : process.env.SESSION_SECRET;
app.use(session({
    secret: secretKey,
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    // TODO set this to secure
    cookie: {
        secure: false,
        maxAge: 1000 * 12 * 60 * 60, // 12 hours expiration rate
        sameSite: true
    }
}));

const options = {
    key: fs.readFileSync(path.join(__dirname, '../.keys/privkey.pem'), 'utf-8'),
    cert: fs.readFileSync(path.join(__dirname, '../.keys/fullchain.pem'), 'utf-8')
};

export type queryType = { id: number, query: string, parameters: (string | number | boolean | JSON | Date | null | undefined)[] }[];
let database: Database<queryType>;

export default function getDatabase (test?:boolean) {
    if (test) {
        return new MockDatabase();
    }
    if (database === undefined) {
        database = new MySQLDatabase();
    }
    return database;
}

process.env.TZ = 'Europe/Amsterdam';

dotenv.config();

// view engine setups
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.all('/api/*', (req, res, next) => {
    const auth = new UserAuthentication(database);
    auth.authenticateUser(req.sessionID).then(val => {
        if (val) {
            next();
        } else {
            return res.redirect('/');
        }
    });
});

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/api', apiRouter);
// catch 404 and forward to error handler
app.use((req: Request, res: Response, next) => {
    next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    // render the error page
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: err
    });
});

https.createServer(options, app).listen(process.env.PORT_HTTPS);
app.listen(8080);

export const appExport = app;
