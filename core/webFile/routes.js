
import { Router } from 'express'
// import { body } from 'express-validator'
// import { auth } from '.co'
import * as control from './controllers.mjs'

import isAuth from '../../middleware/isAuth.js'
import isAccess from '../../middleware/isAccess.js'
import isRole from '../../middleware/isMethod.js'
import isMethod from '../../middleware/isMethod.js'
const router = Router()

// Файлы клиента
router.get('/myFiles', isAuth, control.myFiles)

// создание файла
router.post('/create', isAuth, isMethod('file_create'), control.createFile)

// удаление файла t - target
router.delete('/t/:id', isAuth, isMethod('file_delete'), control.deleteFile)

// approveFile
router.post('/t/:id/approve', isAuth, isMethod('file_approve'), control.approveFile)

// Админ панель Файлы
router.get('/all', isAuth, isMethod('admin_files'), control.getAllFiles)


export default router