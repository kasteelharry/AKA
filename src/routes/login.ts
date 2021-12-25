import express from 'express'

const router = express.Router()
// define a route handler for the default home page
router.get('/', (req, res, next) => {
    res.render('login')
  })
export default router