import { User, Roles } from "../core/base/models/model.js";
import JWT from '../addons/jwt.js'
async function isAuth(req, res, next) {
    if (req.headers.authorization === undefined) {
        res.status(401).json({
            error: 'auth_error',
            error_description: 'authorization header is null',
            error_text: 'заголовок авторизации не указан',
            code: '0006',
        });
        return null;
    }
    const token = req.headers.authorization.split(' ')[1] || null;
    // let token = req.cookies.access_token;
    // проверить JWT
    let user = JWT.verify(token);
    // console.log('user', user)
    // если JWT не валидный
    if (!user) {
        res.status(401).json({
            error: 'auth_error',
            error_description: 'token is not valid',
            error_text: 'токен не валидный',
            code: '0004',
        });
        return null;
    }

    // получить пользователя из БД вместе с данными по связи с ролью
    // 
    let userDB = await User.findOne({
        where: {
            id: user.id,
        },
        include: Roles
        
    });
    // проверить пользователя
    if (userDB === null) {
        res.status(404).json({
            error: 'login_error',
            error_description: 'user not found',
            error_text: 'пользователь не найден',
            code: '0002',
        });
        return null;
    }
    // проверить роль
    if (user.rights !== userDB.role.title) {
        res.status(401).json({
            error: 'auth_error',
            error_description: 'role is not valid',
            error_text: 'роль не валидная',
            code: '0005',
        });
        return null;
    }
    req.user = userDB
    next()
}

export default isAuth