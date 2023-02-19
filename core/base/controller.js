import BinanceAPI from "../../modules/binanceAPI.js";

import TelegramBot from "node-telegram-bot-api";

const TGBot = new TelegramBot('5940809810:AAHeW1cdYEsOSWz7bFSlD-PkyG_gK4J6I2E', { polling: false });

// получить сообщение от телеграма
// TGBot.on('message', (msg) => {
//     const chatId = msg.chat.id;
//     // TGBot.sendMessage(chatId, 'Received your message'+chatId);
// });

const binance_TOKENS = {
    'amal': ['lmTRpBu7E8AtRv5V79nesSKENGsRzjQ7PxzoHVEPd6rbwDTHWJXx5qrTHPzDxer2', '5sNtsrO3Gvt4vkxvDLue4GRtK0R2fVN9RMSDLidQ4pwYzdMwq4XU3SHglu7QuBRh'],
    'fill': ['OTXL8BFWF1SUiSsxS3WjvGGd8qdgU7O0xZqXAaVRzXTAd6sAvxjyfCb0ALlPw6WT', 'edLJoZ5rIVYW9j41b77X5oUftt9gq78uS8CCBLPZRss7oZobnHG3tMMXsTk72SoS']
}

export async function getAlertData(req, res) {
    // Получить ID из :ID
    const { ID } = req.params;
    if (!ID || !binance_TOKENS[ID]) return res.status(400).json({
        status: 'error',
        message: 'ID is not defined',
    });
    let tokens_API = binance_TOKENS[ID];
    let { exchange, coin, direction, price, riskM, leverage } = req.body;
    TGBot.sendMessage(-762436470, `Получен запрос на создание алерта \ntoken: ${coin} \nto: ${direction == 'buy' ? '📈-buy' : '📉-sell'} \nopen_price: ${price} \n\naccount: ${ID}`);
    // Проверить, что все поля есть
    if (!coin || !exchange || !direction || !price) return res.status(400).json({
        status: 'error',
        message: 'Not all fields are defined',
    });
    // риск 7% по умолчанию
    if (!riskM) riskM = 7;

    // плечи по умолчанию 3
    if (!leverage) leverage = 3;

    try {
        let binance = new BinanceAPI(tokens_API[0], tokens_API[1]);

        // binance
        // console.log('BB');

        // создаем бинанс связку
        direction = direction.toUpperCase();
        await binance.setLeverage(coin, leverage);
        // закрыть позицию
        var order = await binance.getOpenPositions(coin)
        let open_orders = 0
        if (order.length > 0) {
            console.log("SELL");
            console.log(order);
            for (const ords in order) {
                let ord = order[ords]
                let positionAmt = ord.positionAmt;
                if (positionAmt != '0.0') {
                    open_orders += 1
                    let DER = positionAmt > 0 ? "SELL" : "BUY"

                    // сделать положительным
                    let positionAmt_total = positionAmt < 0 ? positionAmt * -1 : positionAmt;
                    // закрываем ордер
                    try {
                        await binance.createOrder(coin, DER, positionAmt_total, 0, 'MARKET', 'GTC', false, true, 'CONTRACT_PRICE', false)
                        open_orders -= 1
                    } catch (e) {
                        console.log(e);
                    }
                }
            }
        }

        let balance = await binance.getBalance();
        // елси msg есть в балансе, то ошибка
        try {
            if (balance.msg) {
                TGBot.sendMessage(-762436470, `Ошибка при создании ордера \nERROR: ${balance.msg} \n\naccount: ${ID}`);
            }
        } catch (e) { }
        let usdt_balance = balance.filter(item => item.asset === 'USDT')[0];
        let total_for_trade = usdt_balance.availableBalance * (riskM / 100);

        let coin_info = await binance.getCoinInfo(coin);
        // узнать сколько знаков после запятой
        // console.log(coin_info);

        coin_info = coin_info.symbols;

        // найти нужную пару
        coin_info = coin_info.filter(item => item.symbol === coin)[0];
        // console.log(coin_info);
        // узнать сколько знаков после запятой
        let precision = coin_info.quantityPrecision;
        let pricePrecision = coin_info.filters;
        // найти в pricePrecision PRICE_FILTER
        pricePrecision = pricePrecision.filter(item => item.filterType === 'PRICE_FILTER')[0];
        pricePrecision = pricePrecision.tickSize;
        // сделать из 0.001000 0.001 
        pricePrecision = pricePrecision.split('1')[0].length - 1;




        let count_tokens = ((total_for_trade / price).toFixed(precision)) * leverage;
        let price_ = parseFloat(price).toFixed(pricePrecision);
        console.log(count_tokens, price, price_);
        // make float
        console.log("BUY", open_orders);
        // console.log(data);
        let new_order;
        if (open_orders == 0) {
            // открыть позицию по направлению
            new_order = await binance.createOrder(coin, direction, count_tokens, price_, 'MARKET', 'GTC', false, false, 'CONTRACT_PRICE', false)
            // если msg есть в new_order, значит ошибка
            try {
                if (new_order.msg) {
                    TGBot.sendMessage(-762436470, `Ошибка при создании ордера \nERROR: ${new_order.msg} \n\naccount: ${ID}`);
                }
            } catch (e) { }
        }

        return res.json({
            new_order,
            total_for_trade,
            count_tokens
        })
    } catch (e) {
        TGBot.sendMessage(-762436470, `Ошибка при создании ордера \nERROR: ${e} \n\naccount: ${ID}`);
    }


}