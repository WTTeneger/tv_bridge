import jwt from 'jsonwebtoken'


const settings = {
    check_auth: false,

    JWT_SECRET: 'secret',
    REFRESH_JWT_SECRET: 'secret',


    JWT_MT_TA: '7d',
    JWT_RT_TA: '30d',
}

class JWT {
    // verification of the token
    verify(token) {
        try {
            let token_jwt = token;
            if (token_jwt) {
                let token = jwt.verify(token_jwt, settings.JWT_SECRET);
                return token;
            } else {
                return false;
            }
        } catch (e) {
            return false;
        }
    }
    // create JWT tokens
    create(id, rights, id_role=0, username) {
        let access_token = jwt.sign({ id: id, rights: rights, role_id: id_role, username: username }, settings.JWT_SECRET, { expiresIn: settings.JWT_MT_TA })
        let refresh_token = jwt.sign({ id: id, rights: rights, role_id: id_role, username: username }, settings.REFRESH_JWT_SECRET, { expiresIn: settings.JWT_RT_TA })
        return { access_token, refresh_token}
    }
    
}
export default new JWT();