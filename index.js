
import os from 'os'
import dotenv from 'dotenv'
dotenv.config()
import { app } from './app.js'



import * as fs from 'fs';
import * as http from 'http'
import * as https from 'https'
var privateKey = fs.readFileSync('sslcert/server.key');
var certificate = fs.readFileSync('sslcert/server.crt');

var credentials = {
    key: privateKey,
    cert: certificate,
    // ca: [ca1, ca2]
};


http.createServer(app).listen(80)
https.createServer(credentials, app).listen(8443)

function set_env() {
    process.env.salt_pass = '$2b$10$iQ2q9cCWz63Q3vg8lmdOre'
}
set_env()

