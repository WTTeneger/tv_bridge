
import os from 'os'
import dotenv from 'dotenv'
dotenv.config()
import cluster from 'cluster'
import { app } from './app.js'
// import * as s from './addons/queue/queue.js'
const PORT = process.env.PORT || 8000
// console.log(PORT);



import * as fs from 'fs';
import * as http from 'http'
import * as https from 'https'
var privateKey = fs.readFileSync('sslcert/server.key');
var certificate = fs.readFileSync('sslcert/server.crt');

var credentials = {
    key: privateKey,
    cert: certificate,
};


http.createServer(app).listen(3000)
https.createServer(credentials, app).listen(8443)



function set_env() {
    process.env.salt_pass = '$2b$10$iQ2q9cCWz63Q3vg8lmdOre'
}
set_env()