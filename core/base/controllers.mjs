import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcryptjs';
// class UserController {
import { User, Roles, AboutUser } from "./models/model.js";
import JWT from '../../addons/jwt.js'
import { _appModulesGetKeys, _appModulesGet } from '../../settings.js'
import { log } from "console";

const bucketParams = { Bucket: 'a9fc5923-b2b-opalub' } // <--- заменить



const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validationResult(req) {
    throw new Error('Function not implemented.');
}

export async function login(req, res) {
    // получить данные из формы
    console.log('req.body', req.body);
    let login = req.body.login || null;
    let password = req.body.password || null;
    // проверить данные
    if (login === null || password === null) {
        res.status(404).json({
            error: 'login_error',
            error_description: 'login or password is null',
            error_text: 'логин или пароль не указаны',
            code: '0001',
        });
        return;
    }
    // получить пользователя из БД по логину
    let user = await User.findOne({
        where: {
            login: login,
        },
        include: Roles
    });
    // проверить пользователя
    if (user === null) {
        res.status(404).json({
            error: 'login_error',
            error_description: 'user not found',
            error_text: 'пользователь не найден',
            code: '0002',
        });
        return;
    }
    // если нет user.role.title то выдать ошибку
    if (user.role === null) {
        res.status(404).json({
            error: 'login_error',
            error_description: 'user role not found',
            error_text: 'роль пользователя не найдена',
            code: '0003',
        });
        return;
    }
    // проверить пароль
    let isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('isPasswordValid', isPasswordValid);
    if (!isPasswordValid) {
        res.status(400).json({
            error: 'password_error',
            error_description: 'password is not valid',
            error_text: 'пароль не верный',
            code: '0003',
        });
        return;
    }

    // создать токен
    // отправить токен
    // }
    // if (title in user.role) {
    //     res.status(404).json({
    //         error: 'role_error',
    //         error_description: 'role not found',
    //         error_text: 'роль не найдена',
    //         code: '0004',
    //     });
    //     return;
    // }
    const tokens = JWT.create(user.id, user.role.title, user.role.id, user?.login);
    // console.log(tokens);
    user.JWT_REFRESH_TOKEN = tokens.refresh_token
    await user.save()
    res.header('Content-Type', 'application/json;charset=UTF-8')
    res.cookie('bb__refresh_token', tokens.refresh_token, {
        maxAge: 24 * 60 * 60 * 1000 * 7, // 7 дней
        // sameSite: 'none',
        // secure: true
        httpOnly: true
    });
    res.status(200).json({
        access_token: tokens.access_token,
        // refresh_token: tokens.refresh_token
    });


}

//refresh_token 
export async function refresh(req, res) {
    // получить refresh_token из запроса
    // refresh_token должен быть в куках
    // проверить refresh_token
    const refresh_token = req.cookies.bb__refresh_token || null;
    if (refresh_token === null) {
        res.status(400).json({
            error: 'refresh_token_error',
            error_description: 'refresh_token is null',
            error_text: 'refresh_token не указан',
            code: '0004',
        });
        return;
    }
    // получить пользователя из БД по refresh_token
    let user = await User.findOne({
        where: {
            JWT_REFRESH_TOKEN: refresh_token,
        },
    });
    // проверить пользователя
    if (user === null) {
        res.status(404).json({
            error: 'refresh_token_error',
            error_description: 'user not found',
            error_text: 'пользователь не найден',
            code: '0005',
        });
        return;
    }
    // создать новый access_token
    const tokens = JWT.create(user.id, user.role)

    // сохранить новый refresh_token в БД
    user.JWT_REFRESH_TOKEN = tokens.refresh_token
    await user.save()
    res.cookie('wb_cms__refresh_token', tokens.refresh_token, {
        maxAge: 24 * 60 * 60 * 1000 * 120, // 120 дней
        httpOnly: true
    });
    // отправить новый access_token
    res.status(200).json({
        access_token: tokens.access_token,
        'user': user.rights
    });
}


export async function check_auth(req, res) {
    // получить JWT из bearer
    let userDB = req.user
    if (userDB) {
        // вернуть данные пользователя
        res.status(200).json({
            rights: userDB.role.title,
            is_auth: true
        });
    } else {
        res.status(400).json({
            is_auth: false
        });
    }
}

// get_user_permissions
export async function get_user_permissions(req, res) {
    let userDB = req.user
    let _keys = _appModulesGetKeys()
    // получить только ключи словоря as
    let only_key = { 'as': true }
    let _data = { ..._keys, ...userDB.role.permissions }
    res.status(200).json({
        rights: userDB.role.title,
        id_role: userDB.role.id,
        urls: _data
    })
}

// get_user_info
export async function get_user_info(req, res) {
    let userDB = req.user
    res.status(200).json({
        rights: userDB.role.title,
        id_role: userDB.role.id,
        username: userDB.login,
        // username: userDB.login, 
    })
}



// logout
export async function logout(req, res) {
    // удалить JWT из куки
    // res.clearCookie('access_token');
    res.clearCookie('wb_cms__refresh_token');
    // вернуть ответ
    //
    res.status(200).json({
        is_auth: false
    });
}



// s3
export async function s3(req, res) {

    s3_.listObjects(bucketParams, (err, data) => {
        if (err) {
            return res.status(400).json({
                error: 's3_error',
                error_description: err,
                error_text: 'ошибка s3',
                code: '0006',
            });
        } else {
            // console.log(data)
            res.status(200).json({
                data: data
            });
        }
    });

}



// register
export async function register(req, res) { 
    let { login, password, email } = req.body;

    console.log(login, password, email);
    
    return res.status(200).json({
        login: login,
        password: password,
        email: email
    })
}



// allAccounts

export async function allAccounts(req, res) {
    try {
        console.log(req.filters);

        let accounts = await User.findAll({
            include: [
                {
                    model: Roles,
                    as: 'role'
                },
                // aboutUser
                {
                    model: AboutUser,
                    as: 'about_user',
                }
                // {
                //     model: AboutUser,
                //     as: 'aboutUser'
                // }
            ],
            where: req.filters.where,
            order: req.filters.order,
            limit: req.filters.pagination.pageSize,
            offset: (req.filters.pagination.current - 1) * req.filters.pagination.pageSize,
        })
        let roles = await Roles.findAll({
            // получить id и title
            attributes: ['id', 'title']
        })
        res.status(200).json({
            accounts: accounts,
            roles: roles
    });
    } catch (e) {
        console.log(e);
        res.status(400).json({
            error: 'allAccounts_error',
            error_description: e,
            error_text: 'ошибка allAccounts',
            code: '0006',
        });
    }
}