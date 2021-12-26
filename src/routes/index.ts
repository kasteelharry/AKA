import express from 'express';
const app = express();
const router = express.Router();
// define a route handler for the default home page
app.get('/', (req, res, next) => {
    res.render('login');
  });
export default app;