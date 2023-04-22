import TelegramBot from 'node-telegram-bot-api';
import bull from '../queue/bull_queue.js';
import { no_answers } from "../../core/wb_reviews/models/model.js";
import * as Sentry from "@sentry/node";
import { get_position } from '../../core/wb_reviews/module/range.js';


Sentry.init({
    dsn: "https://d0a26f95ebc54a4785fc6a2408932fc7@o4504224866500608.ingest.sentry.io/4504224870170627",
    tracesSampleRate: 1.0,
});

//get_rank
// getrank
let token = '5678637992:AAHp1oM_uD9roc_Y2h-v61Vq6y0pefRtxVk'; // WBRangeBot
let test = true
if (test) {
    token = '5809365438:AAGLqG9pPRw56T6iByWllVGMULGKKFMHODc'
}
// let token = '5813517065:AAHKctFnxMFgY-_Aa_qL99qESl6j-5FVHp4'; // test bot
let chat_id = '-854343674'
class _TG_RangeAlert {
    bot = null;
    constructor() {
        console.log('Create range bot');
        if (!_TG_RangeAlert.bot) {
            _TG_RangeAlert.bot = new TelegramBot(token, { polling: true });
        }
        this.bot = _TG_RangeAlert.bot;
        // console.log(this.bot);
        this.chat_id = chat_id;
    }

    async send_message_in_tg(to, text, type = 'ru', image = null, button = null) {
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
                        // отправить первую фотографию из группы фото и _button
                        // if()
                        console.log('imgs', imgs);
                        try {
                            if (imgs[0]?.media) {
                                _TG_RangeAlert.bot.sendPhoto(cid, imgs[0].media, { caption: imgs[0].caption, reply_markup: _button.reply_markup })
                            } else {
                                _TG_RangeAlert.bot.sendMessage(cid, text, _button)
                            }
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        } catch (e) {
                            console.log('e');
                        }
                    };
                } else {
                    for (let cid of _chat_id) {
                        _TG_RangeAlert.bot.sendMediaGroup(cid, imgs)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };
                }
            } else {
                // console.log(_chat_id, text, _button);
                if (_button) {
                    for (let cid of _chat_id) {
                        _TG_RangeAlert.bot.sendMessage(cid, text, _button)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };

                } else {
                    for (let cid of _chat_id) {
                        _TG_RangeAlert.bot.sendMessage(cid, text)
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    };

                }
            }
        } catch (e) {
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
                _TG_RangeAlert.bot.sendMessage(to, text, _button)
            } else {
                _TG_RangeAlert.bot.sendMessage(to, text)
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


const _TGRangeAlert = new _TG_RangeAlert()


// отлавливать нажатие на кнопку в телеграме
_TGRangeAlert.bot.on('callback_query', (query) => {
    // если data эт словарь
    console.log(query.data);
    let data = query.data;
    if (data.indexOf('check_rank') !== -1) {
        let id = data.split(':')[1];
        let text = data.split(':')[2];
        //текущее время в timestamp
        console.log(id, text);
        bull.add('wbreviews:get_o_rank', {
            repeat: true,
            // часовой пояс пользователя
            // tz: query.message.edit_date,
            chat_id: query.message.chat.id,
            msg_id: query.message.message_id,
            rank_id: id,
            key_words: text
        });
        // bull.add('wbreviews:get_rank', { chat_id: chatId, msg_id: msg.message_id, rank_id: id, key_words: key_words });
    }


});

// при команде /getid выдать id чата
_TGRangeAlert.bot.onText(/\/getid/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log('chatId  RAMGE - - -', chatId);
    const resp = chatId;
    _TGRangeAlert.bot.sendMessage(chatId, resp);
});

export default _TGRangeAlert;

bull.process('wbreviews:get_o_rank', async function (job, done) {
    console.log(job.data);
    let { poz, len_page, page, data_prod } = await get_position({ id: job.data.rank_id, text: job.data.key_words })
    // console.log('poz_len_page', poz, len_page, page, data_prod);
    let message;
    let key_board = [];
    if (poz > 0) {
        let cl
        try {
            cl = data_prod?.colors[0]?.name ?? ''
        } catch (e) {
            cl = ''
        }

        // ткущая дата в московском часовом поясе
        let date = new Date();
        date = date.toLocaleString("ru", { timeZone: "Europe/Moscow" })
        date = date.split(' ')
        date = date[0] + ' - ' + date[1]

        message = `  
        🆔: ${job.data.rank_id} - "${data_prod?.name || ''} (${cl})"
        \n🔑:"${job.data.key_words}"
        \n🅿️: ${page}
        \n✅: ${poz}
        \n🧧: ${data_prod?.brand || ''}
        \n🗓️: ${date}
        `
        // сжать текст через буфер
        let sf = job.data.key_words;

        key_board = [
            [
                {
                    text: '🔍 Проверить',
                    callback_data: `check_rank:${job.data.rank_id}:${sf}`
                }
            ]
        ]
        let b = Buffer.byteLength(JSON.stringify(key_board), 'utf8');

        // console.log(key_board[0][0]);

        // \n👍 Артикул (${job.data.rank_id}) по запросу "${job.data.key_words}" найден:\nСтраница: ${page}\nПозиция: ${poz}`
    } else {
        message = `
        \n👎 Артикул (${job.data.rank_id}) по запросу "${job.data.key_words}" не найден:\nСтраниц проверено: ${page}`
    }


    if (job.data.repeat === true) {
        console.log('repeat');
        // console.log('_TG_RangeAlert', _TG_RangeAlert.bot);
        await _TG_RangeAlert.bot.editMessageText(message, { chat_id: job.data.chat_id, message_id: job.data.msg_id, reply_markup: { inline_keyboard: key_board } });
        done();
    } else {
        console.log('else');
        await _TG_RangeAlert.bot.sendMessage(job.data.chat_id, message, { reply_markup: { inline_keyboard: key_board } });
        done();
    }
})

// получение данных ранжирования
_TG_RangeAlert.bot.onText(/\/getrank/, (msg, match) => {
    // получить id и ключевое слово из сообщения 
    const chatId = msg.chat.id;
    console.log('chatId - - -', chatId);
    let id = msg.text.split(' ')[1];
    let key_words = msg.text.split(id + ' ')[1];
    console.log(id, key_words, msg.from.timezo);
    // илиu id не int
    if (!id || !key_words || isNaN(id)) {
        _TG_RangeAlert.bot.sendMessage(chatId, 'Неверный формат команды');
        return;
    }
    bull.add('wbreviews:get_o_rank', {
        chat_id: chatId,
        // часовой пояс пользователя
        repeat: false,
        // tz: msg.date,
        msg_id: msg.message_id,
        rank_id: id,
        key_words: key_words
    });
})

// не заканчивать код
// process.stdin.resume();
