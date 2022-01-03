import express from 'express'
import { User } from '../model/users'
import {describeUsers, getAllUsers, getUserByID, getUserByName} from '../database/queries/userQueries'

const router = express.Router()
/* GET users listing. */
router.get('/', (req, res, next) => {
    res.render('users')
})


export default router
