// const { Client } = require('pg');
import Sequelize from 'sequelize'

import pg from 'pg';
// если в env есть DOCKER
let host = process.env.DOCKER ? 'postgres_container' : 'localhost';
host = '85.193.84.9'
let port = '5432'
console.log(host);


const sequelize = new Sequelize(
    'default_db', 'gen_user', 't3ezcypri1', {
    host: host,
    dialectModule: pg,
    port: port,
    dialect: 'postgres', /* 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    freezeTableName: true,
    logging: false,
    idleTimeoutMillis: 0,
    max: 10,
    connectionTimeoutMillis: 0,
    
})
async function delete_idle_connect() {
    let all_pid = await sequelize.query("SELECT pid, usename, usesysid, datid, datname, application_name, backend_start,state_change, state FROM pg_stat_activity  WHERE usesysid = 10 and state = 'idle'");
    console.log(all_pid);
    if (all_pid[0].length > 0) {
        for (let i = 0; i < all_pid[0].length; i++) {
            await sequelize.query(`SELECT pg_terminate_backend(${all_pid[0][i].pid});`);
        }
    }
    // for (let el of all_pid[0]){
    //     console.log(el.pid);
    //     await sequelize.query(`SELECT pg_terminate_backend(${el.pid});`);
        
    // }
    console.log('Все простоявшие соединения закрыты');
// Results will be an empty array and metadata will contain the number of affected rows.
    // setTimeout(delete_idle_connect, 1000 * 60 * 5) // 5 минут;
}

try {
    await sequelize.authenticate()
    console.log('Соединение с БД было успешно установлено')
} catch (e) {
    console.log('Невозможно выполнить подключение к БД: ', e)

}

export default sequelize

