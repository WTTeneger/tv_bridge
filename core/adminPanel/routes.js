
import { Router } from 'express'
// import { body } from 'express-validator'
// import { auth } from '.co'
import * as control from './controllers.mjs'

import isAuth from '../../middleware/isAuth.js'
import isAccess from '../../middleware/isAccess.js'
import isRole from '../../middleware/isMethod.js'
import isMethod from '../../middleware/isMethod.js'
import actionLogger from '../../middleware/actionLogger.js'
const router = Router()


// [СДЕЛКИ]
router.get('/deals', isAuth, isMethod('admin_deals_read'), control.allDeals)
export default router