import express from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path';
import bodyParser from 'body-parser'
import nunjucks from 'nunjucks'
import cors from 'cors'
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import base_router from './core/base/routes.js';
import compression from 'compression'
import cookieParser from 'cookie-parser';

const app = express()
Sentry.init({
    dsn: "https://dcca9ee521a24224ab3344647c74415d@o4504224866500608.ingest.sentry.io/4504224870170625",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
});
// transaction/span/breadcrumb is attached to its own Hub instance
app.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
app.use(Sentry.Handlers.tracingHandler());
// The error handler must be before any other error middleware and after all controllers
app.use(Sentry.Handlers.errorHandler());

const port = 3000

// получить порт из переменной окружения
// const port = process.env.PORT || 3000


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


let setCache = function (req, res, next) {
    const period = 60 * 60 * 24 * 7 * 4 // 1 week
    if (req.method == 'GET') {
        res.set('Cache-Control', `max-age=${period}`)
        // res.set('Cache-control', `public, max-age=${period}`)
        let url = req.url
        if (url.indexOf('.js') > -1) {
            // console.log(url);
            // console.log(req.headers);
            // res.set('Content-Encoding', req.headers['accept-encoding'])
            // res.set('Content-Type', 'text/javascript');
        }
        if (url.indexOf('.css') > -1) {
            // res.addHeader("Content-Encoding", "gzip");
            // res.set('Content-Encoding', req.headers['accept-encoding']);
            // res.set('Content-Type', 'text/css');
        }
        if (url.indexOf('.mp4') > -1) {
            // res.set('Content-Encoding', 'gzip');
            // res.set('Content-Type', 'text/css');
        }
        else {
            // res.set('content-encoding', 'gzip, compress, br')
        }

    } else {
        // res.set('Cache-control', `no-store`)
    }
    // console.log(res);
    // console.log(res.headers);
    next()
}

let redirectHTTPS = function (req, resp, next) {
    // console.log(req.headers);
    // console.log(req);
    try {
        // console.log(req.protocol);
        //  если url не имеет в себе /img/logo.png
        if (req.protocol != 'https' && req.url.indexOf('/img/logo.png') == -1) {
            console.log('ss');
            // console.log('redirect');
            //  редирект на https
            resp.redirect('https://' + req.headers.host + req.url);
        }
        // if (req.protocol == 'http' && req.ur') == -1) {
        //     return resp.redirect(301, 'https://' + req.headers.host + '/');
        // } 
        else {
            return next();
        }
    } catch {
        return next();
    }
};


function shouldCompress(req, res) {
    if (req.headers['x-no-compression']) {
        console.log('no compression', req.headers);
        // don't compress responses with this request header
        return false
    }

    // fallback to standard filter function
    console.log('compression', req.headers);
    return compression.filter(req, res);
}



app.use(bodyParser.urlencoded({
    limit: '150mb',
    parameterLimit: 100000,
    extended: true
}));
var env = nunjucks.configure('templates', {
    autoescape: true,
    express: app
})
app.use(cookieParser());

// шаблонизатор
app.set('view engine', 'html')
// app.use(setCache) // кеширование

app.use(express.static(__dirname + '/static'));
app.use(cors({
    // origin:'http://185.178.47.212:3000',
    origin: [
        'http://217.18.60.198:3000',
        'http://localhost:3000',
        'http://217.18.60.198',
        'https://217.18.60.198',
        'https://itabwb.netlify.app',
        'http://itabwb.netlify.app',
        
        'http://192.168.1.36:3000'],
    credentials: true,
}))
// app.use(cors());
// app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// app.use(redirectHTTPS);

app.use(compression());



// app.use('/', router)
app.use('/', base_router)


export { app };