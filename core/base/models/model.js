import sequelize from "../../../db.js"
import { Sequelize, DataTypes } from 'sequelize'
// console.log(sequelize);

export const User = sequelize.define(
    'users',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // Здесь определяются атрибуты модели
        login: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // связь с таблицей roles
        role_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'roles',
                key: 'id',
            },
            allowNull: true
        },
        rights: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'user',
        },
        JWT_REFRESH_TOKEN: {
            type: DataTypes.STRING,
        },
        aboutUser: {
            // связь с таблицей about_user
            type: DataTypes.INTEGER,
            references: {
                model: 'about_user',
                key: 'id',
            },
            allowNull: true
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

export const AboutUser = sequelize.define(
    'about_user',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // имя
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // фамилия
        surname: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // ИНН
        inn: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // Название компании
        company: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // email
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // телефон
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // Должность
        position: {
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

// Roles
export const Roles = sequelize.define(
    'roles',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // role name
        title: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        permissions: {
            type: DataTypes.ARRAY(DataTypes.STRING),
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
        // Здесь определяются другие настройки модели
    }
);

// Logs
export const Logs = sequelize.define(
    'logs',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        // Здесь определяются атрибуты модели
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'users',
                key: 'id',
            },
            allowNull: false
        },
        
        // действие
        action: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        // дата
        date: {
            type: DataTypes.DATE,
            defaultValue: Sequelize.NOW,
        },
    },
    {
        freezeTableName: true,
        // Здесь определяются другие настройки модели
    }
);



User.belongsTo(Roles, { foreignKey: 'role_id', targetKey: 'id' });
Roles.hasMany(User, { foreignKey: 'role_id', targetKey: 'id' });
User.belongsTo(AboutUser, { foreignKey: 'aboutUser', targetKey: 'id' });
Logs.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });