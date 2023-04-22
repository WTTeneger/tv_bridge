import sequelize from "../db.js";
import { Sequelize, DataTypes } from 'sequelize'
import * as base_models from '../core/base/models/model.js'
import * as files_models from '../core/webFile/models/model.js'
import * as deal_models from '../core/deals/models/model.js'

// import * as update_ac_models from '../core/update_ac/models/model.js'
// import * as update_ac_products from '../core/stock/models/model.js'


class DB{
    // sync
    static async syncAll() {
        await sequelize.sync({ alter: true })
        console.log('Все модели были успешно синхронизированы.')
    }
    // удаляем все таблицы
    static async dropAll() {
        await sequelize.drop()
        console.log('Все таблицы были успешно удалены.')
    }

    // Выполняем синхронизацию только тех моделей, у которых в нахвание есть text регулярное выражение
}

let console_command = {
    sync: DB.syncAll,
    drop: DB.dropAll,
}

// получить текст из консоли
const args = process.argv.slice(2)
// получить команду из консоли
const command = args[0]
// получить текст из консоли
const text = args[1]

// если команда есть в списке команд
if (command in console_command) {
    if (text) {
        // выполняем команду с текстом
        console_command[command](text)
    } else {
        // выполняем команду без текста
        console_command[command]()
    }
} else {
    console.log('Команда не найдена')
}
// process.exit()