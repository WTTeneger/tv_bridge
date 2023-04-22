import bull from './bull_queue.js';
import { wb_accounts } from '../../core/wb_reviews/models/model.js';
import wildberriesAPI from '../../addons/wb_api.js';



bull.process('wbreviews:get_new_questions', async function (job, done) {
    job.progress(10)
    const { supplier_id, WBtoken } = job.data.data;
    let WB_ID = job.data.data.id;
    console.log('WB_ID ', WB_ID);
    let api = new wildberriesAPI({
        'WBToken': WBtoken,
        'suppler': supplier_id
    })
    job.progress(30)
    let res = await api.getQuestions();
    // длинна массива отзывов
    job.progress(70)
    if (res && res.data && res.data.questions && res.data.questions.length > 0) {
        console.log('есть новые вопросы');
        for (let feed of res.data.questions) {
            // console.log(feed);
            // добавляем отзыв в очередь
            bull.add('wbreviews:answer_for_questions', {
                data: {
                    ...feed,
                    supplier_name: job?.data?.data?.supplier_name || null,
                },
                api: {
                    'WB_ID': WB_ID,
                    'WBToken': WBtoken,
                    'suppler': supplier_id
                },
                telegram: {
                    'ru': job.data.data.telegram_group,
                    // 'en': job.data.data.telegram_group_en,
                    // 'en_staff': job.data.data.telegram_group_en_staff
                }
            });
        }
    }
    job.progress(100)
    done();
});

bull.process('wbreviews:get_new_reviews', async function (job, done) {

    job.progress(10)
    const { supplier_id, WBtoken } = job.data.data;
    let WB_ID = job.data.data.id;
    console.log('WB_ID ', WB_ID);
    let api = new wildberriesAPI({
        'WBToken': WBtoken,
        'suppler': supplier_id
    })
    job.progress(30)
    let res = await api.getFeedbacks();
    // длинна массива отзывов
    job.progress(70)
    if (res && res.data && res.data.feedbacks && res.data.feedbacks.length > 0) {
        console.log('есть новые отзывы');
        for (let feed of res.data.feedbacks) {
            // console.log(feed);
            // добавляем отзыв в очередь
            bull.add('wbreviews:answer_for_rewiews', {
                data: feed,
                api: {
                    'WB_ID': WB_ID,
                    'WBToken': WBtoken,
                    'suppler': supplier_id
                },
                telegram: {
                    'ru': job.data.data.telegram_group,
                    'en': job.data.data.telegram_group_en,
                    'en_staff': job.data.data.telegram_group_en_staff
                }
            });
        }
    }
    job.progress(100)
    done();
});

bull.process('wbreviews:check_new_wb_accounts', async function (job, done) {
    // console.log('log - s');
    // console.log(job.data);
    job.progress(10);
    let wb_acc = await wb_accounts.findAll({
        where: { active: 1 },
    })
    job.progress(50);
    bull.emptyQueue('wbreviews:get_new_reviews');
    bull.emptyQueue('wbreviews:get_new_questions');
    job.progress(70);
    // обновить все WBToken в таблице wb_accounts
    if (wb_acc && wb_acc.length > 0) {
        let api = new wildberriesAPI({
            'WBToken': wb_acc[0].WBtoken,
            'suppler': wb_acc[0].supplier_id
        })
        let new_token = await api.refreshToken()
        // добавить все полученные аккаунта в очередь
        let times = []

        for (let el of wb_acc) {
            // console.log(el.WBtoken);
            el.WBtoken = new_token;
            await el.save();
            // случайное число от 10 до 20 и его не должно быть в массиве times
            let time = Math.floor(Math.random() * (20 - 10 + 1)) + 10 + el.timestamps || 0;
            while (times.includes(time)) {
                time = Math.floor(Math.random() * (20 - 10 + 1)) + 10 + el.timestamps || 0;
            }
            times.push(time);


            bull.add(`wbreviews:get_new_reviews`, {
                data: el,
                message: `Проверка новых отзывов у аккаунта ${el.id}`,
                delay: time // задержка в минутах
            }, {
                repeat: {
                    cron: `*/${time} * * * *`, // every 30 minutes
                },
            });

            bull.add(`wbreviews:get_new_questions`, {
                data: el,
                message: `Проверка новых вопросов у аккаунта ${el.id}`,
                delay: time // задержка в минутах
            }, {
                repeat: {
                    cron: `*/${time} * * * *`, // every 
                },
            });

        }
    }

    job.progress(100);
    done();
})
