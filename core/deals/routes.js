
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

// Все сделки (админка)
router.get('/all', isAuth, isMethod('admin_deals_all'), control.allDeals)

// // создание файла
router.post('/create', isAuth, isMethod('deal_create'), actionLogger('Создание заявки'), control.createDeal)



// // удаление файла t - target
// router.delete('/t/:id', isAuth, isMethod('file_delete'), control.deleteFile)


export default router