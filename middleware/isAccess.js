import { User } from "../core/base/models/model.js";
import JWT from '../addons/jwt.js'
import e from "express";
async function isAccess(req, res, next) {
    // console.log('access - ', req.user.role);
    // тип запроса (GET, POST, PUT, DELETE)
    const method = req.method;
    // путь запроса
    const path = req.path;
    // права пользователя
    const permissions = req.user.role.permissions;
    // console.log('user', req.user.role);
    let access = false

    for (let i in permissions) { 
        // tсли в path есть i
        let path_ = path.indexOf(i)
        
        if (path_ !== -1) {
            if (permissions[i] === true) {
                access = true
                break
            } else {
                access = false;
                break
            }
        }
    }
    if (access === false) {
        res.status(403).json({
            error: 'access_error',
            error_text: 'access denied',
            error_description: 'Доступы к этому модулю запрещены для аккаунтов с вашией ролью',
            code: '0007',
        });
        return null;
    }
    next()
}
export default isAccess