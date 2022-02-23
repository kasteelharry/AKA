import 'module-alias/register';
import express, { NextFunction, Request, Response } from 'express';

import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from '@dir/routes/Index';
import loginRouter from '@dir/routes/Login';
import apiRouter from '@dir/routes/apiRoutes';


import dotenv from 'dotenv';
import MySQLDatabase from '@dir/model/MySQLDatabase';
import UserAuthentication from '@dir/util/UserAuthentication';
import { MockDatabase } from './model/MockDatabase';

dotenv.config();


export type queryType = { id: number, query: string, parameters: (string | number | boolean | JSON | Date | null | undefined)[] }[];
let database: Database<queryType> ;

export default function getDatabase(test?:boolean) {
    if (test) {
        return new MockDatabase();
    }
    if (database === undefined) {
        database= new MySQLDatabase();
    }
    return database;
}


const portHttps: number = 8433;
const app = express();

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


app.all("/api/*", (req, res, next) => {
    const auth = new UserAuthentication(database);
    auth.authenticateUser(req.sessionID).then(val => {
        if (val) {
            next();
        } else {
            return res.redirect("/");
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



export const appExport = app;