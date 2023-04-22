
import { Router } from 'express'
// import { body } from 'express-validator'
// import { auth } from '.co'
import * as control from './controllers.mjs'

import isAuth from '../../middleware/isAuth.js'
import isAccess from '../../middleware/isAccess.js'
import isRole from '../../middleware/isMethod.js'
import isMethod from '../../middleware/isMethod.js'
import { getFilters } from '../../middleware/getFilters.js'

const router = Router()
// Авторизация 
router.post('/auth/login', control.login)

// refresh token
router.post('/auth/refresh_token', control.refresh)

// проверка
router.get('/auth/check_auth', isAuth, control.check_auth)

// получить все разрешения для пользователя
router.get('/auth/get_user_permissions', isAuth, control.get_user_permissions)

// получить всю информацию о пользователе
router.get('/auth/get_user_info', isAuth, control.get_user_info)

// деавторизация
router.post('/auth/logout', isAuth, control.logout)



// register
router.post('/auth/register', control.register)


// [-----АДМИН ПАНЕЛЬ-----]

// [АККАУНТЫ]
// получить все аккаунты
router.get('/accounts/all', isAuth, isMethod('admin_accounts_all'), getFilters, control.allAccounts)


export default router