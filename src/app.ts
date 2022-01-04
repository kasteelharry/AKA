import express, { application, NextFunction } from 'express';
import { Request, Response } from 'express';
import session, { Session } from 'express-session';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/index';
import customersRouter from './routes/customers';
import loginRouter from './routes/login';
import productRouter from './routes/Product';
const MySQLStore = require('express-mysql-session')(session);
import {  dbSessionOptions } from './database/database';
import https from 'https';
import http from 'http';
import fs from 'fs';
import dotenv from 'dotenv';
import MySQLDatabase from './model/MySQLDatabase';

export type queryType = { id: number, query: string, parameters: (string | number | boolean | JSON | Date | null | undefined)[]}[];
const database: Database<queryType> = new MySQLDatabase();

export default function getDatabase() {
    return database;
}

const options = {
    key: fs.readFileSync(path.join(__dirname, "../.keys/privkey.pem"), "utf-8"),
    cert: fs.readFileSync(path.join(__dirname, "../.keys/fullchain.pem"), "utf-8")
};
const portHttps:number = 8433;
const app = express();
// const port = 8080;

process.env.TZ = 'Europe/Amsterdam';
const sessionStore = new MySQLStore(dbSessionOptions);
dotenv.config();

// view engine setups
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));
const secretKey:string = process.env.SESSION_SECRET === undefined ? "THISISABACKUPSESSION" : process.env.SESSION_SECRET;
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
app.use('/', indexRouter);
app.use('/customers', customersRouter);
app.use('/login', loginRouter);
app.use('/products', productRouter);

// catch 404 and forward to error handler
app.use( (req: Request, res: Response, next) => {
  next(createError(404));
});

// error handler
app.use( (err: any, req: Request, res: Response, next:NextFunction) => {

  // render the error page
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: err
  });
});

https.createServer(options, app).listen(process.env.PORT_HTTPS);
