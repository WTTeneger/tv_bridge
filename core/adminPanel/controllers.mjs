import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcryptjs';
import JWT from '../../addons/jwt.js'
import { _appModulesGetKeys, _appModulesGet } from '../../settings.js'
import { CreateFile, DeleteFile } from "../../addons/s3.js";
import { log } from "console";
import { Op, UUID } from "sequelize";
import { Deals } from "../deals/models/model.js";
import { Files } from "../webFile/models/model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validationResult(req) {
    throw new Error('Function not implemented.');
}



// allDeals
export const allDeals = async (req, res) => {
    console.log('allDeals');
    let deals = await Deals.findAll({})
    res.status(200).json({
        deals: deals
    });
}


//approveFile
