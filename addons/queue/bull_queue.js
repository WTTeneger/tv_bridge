import Bull from 'bull';
import milliseconds from "milliseconds";
// если в env есть переменная REDIS_HOST, то берем ее, иначе берем localhost
const redisUrl = process.env.REDIS_HOST || 'localhost';
// const redisUrl = 'localhost';
const redis = {
    host: redisUrl, // Redis host
    port: 6379, // Redis port
    maxRetriesPerRequest: null, // Максимальное количество попыток переподключения к Redis 
    connectTimeout: 180000, // TCP Connection timeout setting (default: 180000)
    password: 'ITAB_willberiesdb_PASS_rs', // Redis auth password
};

const defaultJobOptions = {
    removeOnComplete: false, // Удалять задачу после выполнения
    removeOnFail: false, // Удалять задачу после неудачного выполнения
    attempts: 1, // Количество попыток выполнения задачи
    backoff: {
        type: 'fixed',
        delay: milliseconds.seconds(1), // Задержка между попытками выполнения задачи
    },
    timeout: milliseconds.minutes(1), // Время выполнения задачи
};

const limiter = {
    max: 10, // Максимальное количество задач в очереди
    duration: 100000, // Время в миллисекундах, в течение которого не должно быть больше max задач
    bounceBack: false, // Если true, то задачи, которые не могут быть добавлены из-за превышения лимита, будут добавлены в очередь сразу после того, как количество задач в очереди станет меньше max
};

const settings = {
    lockDuration: 6000, // Время в миллисекундах, в течение которого задача будет заблокирована
    stalledInterval: 5000, // Время в миллисекундах, в течение которого задача будет считаться зависшей
    maxStalledCount: 2, // Количество раз, которое задача может быть зависшей, прежде чем она будет помечена как зависшая
    guardInterval: 25000, // Время в миллисекундах, в течение которого guard будет проверять зависшие задачи
    retryProcessDelay: 30000, // Время в миллисекундах, в течение которого задача будет отложена перед повторной попыткой обработки
    drainDelay: 5, // Время в миллисекундах, в течение которого задача будет отложена перед завершением очереди
};

const bull = new Bull('my_queue', {
    redis, defaultJobOptions, settings, limiter
});

// очистка зависших задач
bull.clean = async () => {
    const jobs = await bull.getJobs(['delayed', 'active', 'waiting']);
    // console.log(jobs);
    let jobsIds = []
    for (let el of jobs) {
        jobsIds.push(el.id)
    }
}

bull.emptyQueue = async (name) => {
    // console.log(name);
    // await bull.getJobs(['delayed, active']) или []
    const jobs = await bull.getJobs(['delayed']) || [];
    // console.log(jobs);
    let jobsIds = []

    if (jobs && jobs.length > 0) {
        for (let el of jobs) {
            if (el != null) {
                // console.log(el);
                console.log(el.name);
                if (el.name === name) {
                    console.log('удаляем');
                    // jobsIds.push(el.id);
                    // остановить очередь
                    // удалить jobs
                    // запустить очередь
                    // await bull.pause();
                    await el.remove();
                    

                    await el.remove();
                    await el.discard();
                }
            }
        }
        await bull.removeJobs(jobsIds);
    } else[
        console.log('jobs is null')
    ]
}

// при подключении к очереди
bull.on('ready', async () => {
    console.log('Bull ready');
    // await bull.clean();
})

// при не подключении к очереди
bull.on('error', async (err) => {
    console.log('Bull error', err);
})


export default bull;