import express, { NextFunction } from 'express'
import { Request, Response } from 'express';
import createError from 'http-errors';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/Index';
import customersRouter from './routes/customers';
import loginRouter from './routes/Login';
import productRouter from './routes/Product';

const app = express();
const port = 8080;
process.env.TZ = 'Europe/Amsterdam';
// view engine setups
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/', indexRouter);
app.use('/customer', customersRouter);
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

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });

module.exports = app;
