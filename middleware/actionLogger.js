import { Logs } from "../core/base/models/model.js";

const actionLogger = (action = '') => {
    return (req, res, next) => {
        try {
            if (action !== '') {
                Logs.create({
                    user_id: req.user.id,
                    action: action,
                    date: new Date()
                })
            }
        } catch (e) { 
            console.log("logger error")
        }
        next();
    }
};
export default actionLogger