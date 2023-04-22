import sequelize from "../../../db.js"
import { Sequelize, DataTypes } from 'sequelize'
// console.log(sequelize);

import { User } from "../../base/models/model.js";

export const Files = sequelize.define(
    'files',
    {
        id: {
            // uuid 
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
        },
        fileName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        author: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
            allowNull: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'active',
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: true,
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
Files.belongsTo(User, { foreignKey: 'author', targetKey: 'id' });