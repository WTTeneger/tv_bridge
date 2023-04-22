import TelegramBot from 'node-telegram-bot-api';
import bull from '../queue/bull_queue.js';
import { no_answers } from "../../core/wb_reviews/models/model.js";
import * as Sentry from "@sentry/node";
Sentry.init({
    dsn: "https://d0a26f95ebc54a4785fc6a2408932fc7@o4504224866500608.ingest.sentry.io/4504224870170627",
    tracesSampleRate: 1.0,
});
// import './range_bot.js'


let chat_id = '-1001172676361' // rus - rus 
let chat_id_en = '-1001725374833' // en

let token = '5637343096:AAGiToQ01-moaOkr7RklEbOmPcsdZQ6SCP8';
//  dev
let test = true
if (test) {
    token = '5809365438:AAGLqG9pPRw56T6iByWllVGMULGKKFMHODc' //hz
    token = '5813517065:AAHKctFnxMFgY-_Aa_qL99qESl6j-5FVHp4' //test bot
    chat_id = '-672141834'
    chat_id_en = '-672141834'
}

// , {polling: true});
// constTGAlert.bot = new TelegramBot(token, { polling: true });

class _TGAlert {
   bot = null;
    constructor() {
        console.log('Create alert bot WBALERT');
        if (!_TGAlert.bot) {
            _TGAlert.bot = new TelegramBot(token, { polling: true });
        }
        this.bot = _TGAlert.bot;
        // console.log(this.bot);
        this.chat_id = chat_id;
    }

    async send_message_in_tg(to, text, type = 'ru', image = null, button = null) {
        let er_chat = ''
        try {
            let _chat_id = type === 'ru' ? to['ru'] : to['en']
            console.log('chat_id', _chat_id);

            let _button = button ? {
                reply_markup: JSON.stringify({
                    inline_keyboard: button
                })
            } : null
            if (image) {
                let imgs = []
                for (let img of image) {
                    let img_url = 'https://feedbackphotos.wbstatic.net/' + img.fullSizeUri;
                    // если это первый элемент то добавляем текст
                    if (imgs.length === 0) {
                        if (_button?.reply_markup) {
                            imgs.push({ type: 'photo', media: img_url, caption: text, reply_markup: _button.reply_markup })
                        } else {
                            imgs.push({ type: 'photo', media: img_url, caption: text })
                        }
                    } else {
                        imgs.push({ type: 'photo', media: img_url })
                    }
                }
                if (_button) {
                    for (let cid of _chat_id) {
                        er_chat = cid
                        // отправить первую фотографию из группы фото и _button
                        // if()
                        console.log('imgs', imgs);
                        try {
                            if (imgs[0]?.media) {
                                await TGAlert.bot.sendPhoto(cid, imgs[0].media, { caption: imgs[0].caption, reply_markup: _button.reply_markup })
                            } else {
                                await TGAlert.bot.sendMessage(cid, text, _button)
                            }// await.sendPhoto
                            //TGAlert.bot.sendMediaGroup(cid, imgs, _button)
                            // await TGAlert.bot.sendMediaGroup(cid, imgs, )
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (e) {
                            console.log('e');
                        }
                    };
                } else {
                    for (let cid of _chat_id) {
                        er_chat = cid
                        await TGAlert.bot.sendMediaGroup(cid, imgs)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };
                }
            } else {
                // console.log(_chat_id, text, _button);
                if (_button) {
                    for (let cid of _chat_id) {
                        er_chat = cid
                        await TGAlert.bot.sendMessage(cid, text, _button)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };

                } else {
                    for (let cid of _chat_id) {
                        er_chat = cid
                        await TGAlert.bot.sendMessage(cid, text)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };

                }
            }
        } catch (e) {
            console.log('eroor in chat', er_chat);
            console.log(e);
            Sentry.captureException(e);
            try {
                if (e?.response?.body?.description == 'Too Many Requests: retry after 1') {
                    let _time = Math.floor(Math.random() * 10) + 1;
                    await new Promise(resolve => setTimeout(resolve, _time * 1000));
                    this.send_message_in_tg(text, type, image, button);
                }
                // если чат не най
                if (e?.response?.body?.description == 'Bad Request: chat not found') {
                    console.log('Bad Request: chat not found');
                }

                // если слишком длинное сообщение
                if (e?.response?.body?.description == 'Bad Request: message is too long') {
                    console.log('Bad Request: message is too long');
                    let _text = text.substring(0, 4000);
                    this.send_message_in_tg(to, _text, type, image, button);
                }

            } catch (e) {
                console.log('e', e);
                Sentry.captureException(e);
            }
        }
    }


    async send_standart_message_in_tg(to, text, button = null, tg_key = null) {
        let _button = button ? {
            reply_markup: JSON.stringify({
                inline_keyboard: button
            })
        } : null

        if (tg_key !== null) {
            let bot_ = new TelegramBot(tg_key);
            if (_button) {
                await bot_.sendMessage(to, text, _button)
            } else {
                await bot_.sendMessage(to, text)
            }
        } else {
            if (_button) {
                await TGAlert.bot.sendMessage(to, text, _button)
            } else {
                await TGAlert.bot.sendMessage(to, text)
            }

        }


        // await new Promise(resolve => setTimeout(resolve, 1000));
    }


    // ответить на сообщение reply_to_message
    async send_message_in_tg_reply(to, reply_to_message_id, text) {
        if (!reply_to_message_id) {
            TGAlert.bot.sendMessage(to, text)
        }
        TGAlert.bot.sendMessage(to, text, { reply_to_message_id: reply_to_message_id })
    }

    async edit_message_in_tg(chat_id, message_id, text, button = null) {
        // отредактировать сообщение убрать кнопки
        let _chat_id = chat_id;
        console.log('edit_message_in_tg', chat_id, message_id, text);
        // отредактировать сообщение но оставить кнопку 
        let _button = button ? {
            reply_markup: JSON.stringify({
                inline_keyboard: button
            })
        } : null
        console.log('edit_message_in_tg', _button);
        TGAlert.bot.editMessageText(text, { chat_id: _chat_id, message_id: message_id, reply_markup: _button?.reply_markup })
    }

    async delete_message_in_tg(chat_id, message_id) {
        // удалить сообщение
        TGAlert.bot.deleteMessage(chat_id, message_id)
    }
}

// созд
// отправить сообщение в телеграм

let TGAlert = new _TGAlert();
// console.log('TGAlert', _TGAlert.bot);
// console.log('TGAlert', TGAlert.bot);

// отлавливать нажатие на кнопку в телеграме
TGAlert.bot.on('callback_query', (query) => {
    console.log(query);
    // return
    // console.log(query);
    let data = query.data;
    console.log(data);
    // если в data есть send_answer__123123 то отправить ответ
    if (data.indexOf('answer__') !== -1) {
        let id = data.split('__')[1];
        console.log('sender_id', id);
        // 
        bull.add('wbreviews:answer_by_id', { id: id, tg: { chat_id: query.message.chat.id, message_id: query.message.message_id } });
    }
    if (data.indexOf('answerque__') !== -1) {
        let id = data.split('__')[1];
        console.log('sender_id que', id);
        // 
        bull.add('wbreviews:answer_by_id', { id: id, type: 'que', tg: { chat_id: query.message.chat.id, message_id: query.message.message_id } });
    }
    // send_answer_no
    if (data.indexOf('send_answer_no') !== -1) {
        // удалить сообщение
        TGAlert.bot.deleteMessage(query.message.chat.id, query.message.message_id);
    }
    // если data эт словарь
    // if (data.indexOf('check_rank') !== -1) { 
    //     let id = data.split(':')[1];
    //     let text = data.split(':')[2];
    //     //текущее время в timestamp
    //     // console.log(q);
    //     bull.add('wbreviews:get_rank', {
    //         repeat: true,
    //         // часовой пояс пользователя
    //         // tz: query.message.edit_date,
    //         chat_id: query.message.chat.id, msg_id: query.message.message_id, rank_id: id, key_words: text
    //     });
    //     // bull.add('wbreviews:get_rank', { chat_id: chatId, msg_id: msg.message_id, rank_id: id, key_words: key_words });
    // }


});

// при команде /getid выдать id чата
TGAlert.bot.onText(/\/getid/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log('chatId ALERT - - -', chatId);
    const resp = chatId;
    TGAlert.bot.sendMessage(chatId, resp);
});

// ожидать любое сообщение без /
TGAlert.bot.on('message', async (msg) => {
    console.log('ss');
    try {
        let text_ = '';
        let id_ = '';
        let tp = 'feed';
        console.log(msg);
        console.log(msg?.reply_to_message?.reply_markup?.inline_keyboard);
        if (msg.reply_to_message && msg.reply_to_message.from.is_bot === true && msg.reply_to_message.reply_markup) {
            for (let el of msg.reply_to_message.reply_markup.inline_keyboard) {
                for (let el2 of el) {
                    if (el2.callback_data.indexOf('answer__') !== -1 || el2.callback_data.indexOf('na__') !== -1) {
                        let id = el2.callback_data.split('__')[1];
                        id_ = id;
                        // console.log('sid', id);
                        // найти в таблице no_answers ответов по id squilice

                        let no_answered = await no_answers.findOne({
                            where: {
                                id: id,
                                isAnswered: false,

                            },
                        })
                        if (!no_answered) {
                            TGAlert.bot.sendMessage(msg.chat.id, 'Ответ уже отправлен');
                            // удалить сообщение на которое я ответил
                            TGAlert.bot.deleteMessage(msg.chat.id, msg.reply_to_message.message_id);
                            return;
                            // если нет ответа то отправить ответ
                            // let answer = await answers
                        }
                        // console.log('no_answered', no_answered);
                        let data_ = no_answered.feedback_data
                        no_answered.text = msg.text;
                        no_answered.save()
                        // console.log(data_);
                        let stars = '';
                        for (let i = 0; i < data_.productValuation; i++) {
                            stars += '⭐️';
                        }
                        text_ = `✅:${data_.productDetails.supplierArticle} “${data_.productDetails.productName}”
                        \n🆘: “${data_.text}”
                        \n🆔:${data_.nmId}
                        \n🏆: ${stars}
                        \n🔒:${data_.subjectId}
                        \n🏦:${data_.productDetails.brandName || 'not found'}
                        \n🧧: ${data_.productDetails.supllerName || 'not found'}
                        \n📝: ${msg.text}`
                    }
                    else if (el2.callback_data.indexOf('answerque__') !== -1 || el2.callback_data.indexOf('que__') !== -1) {
                        let id = el2.callback_data.split('__')[1];
                        id_ = id;
                        tp = 'que';
                        let no_answered = await no_answers.findOne({
                            where: {
                                id: id,
                                isAnswered: false,

                            },
                        })
                        if (!no_answered) {
                            TGAlert.bot.sendMessage(msg.chat.id, 'Ответ уже отправлен');
                            // удалить сообщение на которое я ответил
                            TGAlert.bot.deleteMessage(msg.chat.id, msg.reply_to_message.message_id);
                            return;
                            // если нет ответа то отправить ответ
                            // let answer = await answers
                        }
                        // console.log('no_answered', no_answered);
                        let data_ = no_answered.feedback_data
                        no_answered.text = msg.text;
                        no_answered.save()
                        // console.log(data_);
                        let stars = '';
                        for (let i = 0; i < data_.productValuation; i++) {
                            stars += '⭐️';
                        }
                        text_ = `✅:${data_.productDetails.supplierArticle} “${data_.productDetails.productName}”
                        \n🆘: “${data_.text}”
                        \n🆔:${data_.productDetails.nmId}
                        \n🧧: ${data_?.supplier_name || data_?.productDetails?.nmId || 'not found'}
                        \n📝: ${msg.text}`
                    }
                    break
                    // return
                }
            }

            let button = [[{
                text: 'Подтверждаю',
                callback_data: tp === 'que' ? `answerque__${id_}` : `answer__${id_}`
            }],
            [{
                text: 'Нет',
                callback_data: `send_answer_no`
            }]
            ]
            // получить чат в котором было отправлено сообщение
            // let chat_id = msg.reply_to_message.chat.id;
            TGAlert.bot.sendMessage(msg.chat.id, text_, {
                reply_markup: JSON.stringify({
                    inline_keyboard: button
                })
            })
        }
    } catch (e) {
        console.log('ee', e);
        Sentry.captureException(e);
    }
});
export default TGAlert;