import { fileURLToPath } from "url";
import { dirname } from "path";
import bcrypt from 'bcryptjs';
// class UserController {
import { Files } from "./models/model.js";

import JWT from '../../addons/jwt.js'
import { _appModulesGetKeys, _appModulesGet } from '../../settings.js'
import { CreateFile, DeleteFile } from "../../addons/s3.js";
import { log } from "console";
import { Op } from "sequelize";
import { User } from "../base/models/model.js";

const bucketParams = { Bucket: 'a9fc5923-b2b-opalub' } // <--- заменить

const isEmpty = (obj) => {
    return (
        obj
        && Object.keys(obj).length === 0
        && Object.getPrototypeOf(obj) === Object.prototype)
}


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function validationResult(req) {
    throw new Error('Function not implemented.');
}

export async function myFiles(req, res) {
    // получить данные из формы
    let files = []
    try {
        files = await Files.findAll({
            where: {
                author: req.user.id,
                status: {
                    [Op.ne]: 'deleted'
                },
            },
            // сортировка по дате создания
            order: [
                ['createdAt', 'DESC']
            ],
            // Связть с таблицей users по id = author получить поле login
            include: [{ model: User, attributes: ['login'] }]
        })
    } catch (e) {
        console.log(e);
        files = []
    }
    res.status(200).json({
        files: files,
        // refresh_token: tokens.refresh_token
    });


}

// создать файл
export async function createFile(req, res) {
    //  body = [{file: 'file', title: 'title'}]
    if (!req.body.files) {
        res.status(404).json({
            error: 'file_error',
            error_description: 'file or title is null',
            error_text: 'файлы не указаны',
            code: '0005',
        });
        return;
    }
    let answer = []
    for (let f of req.body.files) {
        let file = f.file || null;
        let title = f.title || null;

        if (file === null || title === null) {
            answer.push({
                error: 'file_error',
                error_description: 'file or title is null',
                error_text: 'файл или название не указаны',
                code: '0005',
            })
            // res.status(404).json({
            //     error: 'file_error',
            //     error_description: 'file or title is null',
            //     error_text: 'файл или название не указаны',
            //     code: '0005',
            // });
            // return;
        }
        let type = title.split('.').pop()


        // проверка на тип файла (пока убрали проверку, все файлы будут храниться, 
        // просто часть сможет открываться онлайн а часть нет)

        // if (type === 'jpg' || type === 'png' || type === 'jpeg') {
        //     res.status(404).json({
        //         error: 'file_error',
        //         error_description: 'file type is not supported',
        //         error_text: 'тип файла не поддерживается',
        //         code: '0006',
        //     })
        //     return;
        //  }

        let titleWithTime = title.replace('.' + type, '')
        titleWithTime = titleWithTime + Date.now() + '.' + type

        Files.create({
            fileName: title,
            type: type,
            author: req.user.id,
            // загружается
            status: 'uploading'
        }).then((newFile) => {
            let nameFileInS3 = newFile.id + '.' + type

            CreateFile(file, nameFileInS3).then((data) => {
                console.log('data', data);
                newFile.status = 'uploaded'
                newFile.url = data.Location
                newFile.save()
            })
        })
        answer.push({
            status: "ok",
            fileStatus: "uploading",
            // fileId: ,
            title: title
        })
    }
    res.status(200).json(answer)
}

// удалить файл (пометить как удаленный)
export async function deleteFile(req, res) {
    let id = req.params.id || null;
    // причина удаления
    let reason = req.body.reason || 'Без указания причины';
    console.log('id', id);
    if (id === null) {
        res.status(404).json({
            error: 'file_error',
            error_description: 'file id is null',
            error_text: 'id файла не указан',
            code: '0007',
        });
        return;
    }
    let file
    try {
        file = await Files.findOne({
            where: {
                id: id,
                status: {
                    [Op.ne]: 'deleted'
                }
            }
        })
    } catch (e) {
        res.status(404).json({
            error: 'file_error',
            error_description: 'file not found',
            error_text: 'файл не найден',
            code: '0008',
        });
        return;
    }
    if (file === null) {
        res.status(404).json({
            error: 'file_error',
            error_description: 'file not found',
            error_text: 'файл не найден',
            code: '0008',
        });
        return;
    }
    if (file.author !== req.user.id && req.user.rights !== 'admin') {
        res.status(404).json({
            error: 'file_error',
            error_description: 'file not found',
            error_text: 'У вас нет прав на удаление этого файла',
            code: '0008',
        });
        return;
    }

    file.status = 'deleted'
    file.reason = reason
    file.save()

    // DeleteFile(id).then((data) => {
    //     console.log('data', data);
    //     newFile
    //     newFile.save()
    // })
    res.status(200).json({
        status: "ok",
        fileStatus: "deleted",
    })
}

// Утвердить догоовор
export const approveFile = async (req, res) => {
    const { id } = req.params;
    console.log('AS', id);
    let file = await Files.findOne({
        where: {
            id: id,
        }
    })

    if (file === null) {
        res.status(404).json({
            error: 'file_error',
            error_description: 'file not found',
            error_text: 'файл не найден',
            code: '0005',
        });
        return;
    }

    file.status = 'approved'
    await file.save()

    res.status(200).json({
        file: file,
        status: 'ok'
    })
}

// Все файлы (Админка)

export const getAllFiles = async (req, res) => {
    try {
        let rq = JSON.parse(req.query[0])
        let { pagination, filters, sorter } = rq
        // если pagination == {}

        pagination = !isEmpty(pagination) ? pagination : {
            current: 1,
            pageSize: 10
        }
        filters = !isEmpty(filters) ? filters : {}
        sorter = !isEmpty(sorter) ? sorter : {
            field: 'createdAt',
            order: 'descend'
        }

        let where = {}

        for (const i of Object.keys(filters)) {
            if (filters[i] === null) { continue }
            where[i] = {
                // проверить значение из массива [active, deleted]
                [Op.in]: filters[i]
            }
        }

        // if sorter пустой то сортировать по дате создания
        // if (sorter === undefined) {
        //     sorter = {
        //         field: 'createdAt',
        //         order: 'descend'
        //     }
        // }


        console.log(pagination, filters, sorter, !isEmpty(sorter));
        console.log(where);
        let files = await Files.findAll({
            where: where,
            // сортировка по дате создания
            order: [
                [sorter.field, sorter.order === 'descend' ? 'DESC' : 'ASC']
            ],

            // получить только 10 записей
            limit: pagination.pageSize,
            // пропустить 10 записей
            offset: (pagination.current - 1) * pagination.pageSize,

            // Связть с таблицей users по id = author получить поле login
            include: [{ model: User, attributes: ['login'] }]
        })
        res.status(200).json({
            files: files,
        })
    } catch (e) {
        console.log(e);
        res.status(400).json({
            error: 'file_error',
            error_description: 'file not found',
            error_text: 'Файлы не найден',
            code: '0005',
        })
    }
}