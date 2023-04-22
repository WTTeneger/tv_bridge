import sequelize from "../../../db.js"
import { Sequelize, DataTypes } from 'sequelize'
// console.log(sequelize);

import { User } from "../../base/models/model.js";
import { Files } from "../../webFile/models/model.js";

// таблица сделки - 
export const Deals = sequelize.define(
    'deals',
    {
        id: {
            // uuid 
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },

        // название сделки
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // описание сделки
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },

        // автор сделки
        author: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
        },

        // counterparty
        counterparty: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
                // not-null = false
                constraints: false,
            },
        },

        // статус сделки
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active',
            validate: {
                isIn: {
                    args: [['new', 'check', 'active', 'closed', 'deleted', 'findCounterparty']],
                    msg: "Must be active, closed, deleted, findCounterparty"
                }
            }
            /* 
                active - активная сделка
                closed - закрытая сделка
                deleted - удаленная сделка
                findCounterparty - поиск контрагента
            */
        },

        createdAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        }
    },
    {
        freezeTableName: true,
    }
);

// связь с таблицей users
Deals.belongsTo(User, { foreignKey: 'author', targetKey: 'id' });
Deals.belongsTo(User, {
    foreignKey: 'counterparty', targetKey: 'id',
    // разрешить null
    allowNull: true,
    constraints: false,

});

// связть в 1 сделкке может быть несколько файлов
Deals.belongsToMany(Files, {
    through: 'deal_files',
    as: 'files',
    foreignKey: 'deal_id',
});