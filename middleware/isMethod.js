import { User } from "../core/base/models/model.js";
import JWT from '../addons/jwt.js'
import e from "express";

const isMethod = (method) => {
    return (req, res, next) => {
        const permissions = req.user.role.permissions || [];
        // если массив permissions не содержит роль all
        // и не содержит роль method
        if (permissions.includes("all")) {
            return next();
        } else if (permissions.includes(method)) {
            return next();
        } else {

            return res.status(403).json({
                "error": "access_error",
                "error_description": "You do not have permission to perform this operation",
                "error_text": "У вас нет прав для выполнения этой операции",
                "code": "401"
            })
        }
    };
};
export default isMethod