import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcryptjs';
// class UserController {
import { Deals } from "./models/model.js";

import JWT from '../../addons/jwt.js'
import { _appModulesGetKeys, _appModulesGet } from '../../settings.js'
import { CreateFile, DeleteFile } from "../../addons/s3.js";
import { log } from "console";
import { Op, UUID } from "sequelize";
import { Files } from "../webFile/models/model.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validationResult(req) {
    throw new Error('Function not implemented.');
}


export async function allDeals(req, res) {

    // получить данные из формы
    let deals = []
    try {
        deals = await Deals.findAll({
            // where: {
            //     author: req.user.id,
            // }
        })
    } catch (e) {
        console.log(e);
        deals = []
    }
    res.status(200).json({
        deals: deals
    });
}



export async function createDeal(req, res) {
    let title = req.body.title || null;
    let description = req.body.description || null;
    let files = req.body.files || null;

    if (title === null || description === null) {
        res.status(404).json({
            error: 'deal_error',
            error_description: 'title, description or files is null',
            error_text: 'название, описание или файлы не указаны',
            code: '0005',
        });
        return;
    }
    files = files || []

    let deal = {
        title: title,
        description: description,
    }

    // console.log(files);
    let filesArray = []
    for (let as of files) {
        if (as.file && as.title) {
            let type = as.title.split('.').pop()
            let title = as.title;
            title = title.replace('.' + type, '')
            title = title + Date.now() + '.' + type
            console.log('as.file', title);

            let newFile = await Files.create({
                fileName: title,
                type: type,
                author: req.user.id,
                // загружается
                status: 'uploading'
            })
            let nameFileInS3 = newFile.id + '.' + type
            await CreateFile(as.file, nameFileInS3).then((data) => {
                console.log('data', data);
                if (data) {
                    newFile.status = 'uploaded'
                    newFile.url = data.Location
                    newFile.save()
                    filesArray = filesArray || []
                    filesArray.push(newFile.id)
                    // deal.deals_files.push({
                    //     id: newFile.id,
                    //     url: newFile.url,
                    //     fileName: title,
                    // })
                }
            })
        }
    }
    deal.author = req.user.id
    deal.status = 'new'
    let _deal = await Deals.create(deal).catch((e) => {
        console.log(e)
    })

    for (let as of filesArray) {
        await _deal.addFiles(as)
    }
    let DDeal = await Deals.findByPk(_deal.id, {
        include: [{
            model: Files,
            as: "files",
            attributes: ['id', 'fileName', 'url', 'type', 'status'],
        }]
    })

    return res.status(200).json({
        deal: DDeal
    })
}