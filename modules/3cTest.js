import threeCommasAPI from './3commas.js';


let api_1 = '54526ece1ca04e71bf35fa98fc88d19703076483900c468bb3d666349685032a'
let api_2 = '3b0439be408503039e0000f5a2c3fc2f118b337abadac3be53f411168d0306062d1ee50bc1430247cd4bd3c2b27eb620c976c950b468b240afe77d3d05dffd492c4f65c619cfb09f3daf8499a54f2f3cb18005fa8cf04d5f118d0e6d33b004baba4afa5a'
const api = new threeCommasAPI({
    apiKey: api_1,
    apiSecret: api_2,
    // forcedMode: 'paper'
})

let _params = {
    derection: 'buy',
    pair: 'USDT_HOOK',
    account_id: 32249456,
    leverage: 4,
    units: 10,
    trailing: 0.3,
    SL_price: 0,
    TP_price: 0,
    SL_percent: 2,
    TP_percent: 0.6,

    balance_percent: 0.1,
}

/**
 * функция расчета ROE
 * 
 * @param {*} enter цена входа
 * @param {*} percent  процент ROE
 * @param {*} leverage плечо
 * @param {*} derection направление сделки (buy, sell)
 * @returns цена выхода для ROE
 *
 *  
 **/
function MakeROE(enter, percent, leverage, derection) {
    console.log(enter, percent, leverage, derection);
    // ROE 2 % для 7 плеча
    // 1.590 * 0.02 = 0.0318 / 7 = 0.0045 | 1.590 + 0.0045 = 1.5945

    let commission = 0.01
    let add_value = parseFloat((enter * (percent * 0.01)) / leverage)
    add_value = parseFloat(add_value + (add_value * commission))

    return (derection == 'buy' ? enter + add_value : enter - add_value)
}


// Создание сделки по паре
export async function create_deal(params) {

    // получить баланс аккаунта

    let binance_pair = params.pair.split('_')[1] + params.pair.split('_')[0]
    // получить цену валютной пары
    let price_pair = 0
    await api.getPairsBids({
        symbol: binance_pair,
        limit: 20
    }).then((data) => {
        price_pair = parseFloat(params.derection == 'sell' ? data.bids[0][0] : data.asks[0][0])
    })

    if (params.balance_percent) {
        let balance = 0
        await api.accountLoadBalances(params.account_id).then((data) => {
            // console.log(data);
            balance = parseFloat(data.usd_amount)
        })
        console.log('balance', balance);
        let balance_for_deal = parseFloat(parseFloat(balance) * parseFloat(params.balance_percent))
        console.log('balance_for_deal', balance_for_deal);
        params.units = parseFloat(balance_for_deal / price_pair) * params.leverage
    }
    // return true

    // расчет доп шагов цены для SL и TP
    // let psl = parseFloat(price_pair * ((0.01 * params.SL_percent) / params.leverage))
    // let ptp = parseFloat(price_pair * ((0.01 * params.TP_percent) / params.leverage))


    // расчет цены на которую нужно ставить SL и TP
    // params.SL_price = params.derection == 'buy' ? price_pair - psl : price_pair + psl
    // params.TP_price = params.derection == 'buy' ? price_pair + ptp : price_pair - ptp
    params.SL_price = MakeROE(price_pair, params.SL_percent, params.leverage, params.derection)
    
    params.TPFirst_price = MakeROE(price_pair, params.TP_first, params.leverage, params.derection)
    params.TP_price = MakeROE(price_pair, params.TP_percent, params.leverage, params.derection)
    params.TPMax_price = MakeROE(price_pair, params.TP_max, params.leverage, params.derection)




    params.type_or = params.derection == 'buy' ? 'bid' : 'ask'
    params.type_sl = 'ask'
    params.type_tp = 'bid'


    params.TP_trailing = parseFloat(params.TP_trailing) / params.leverage
    params.SL_trailing = parseFloat(params.SL_trailing) / params.leverage

    // return true
    api.createSmartTradesV2({
        "account_id": params.account_id,
        "pair": params.pair,
        "position": {
            "type": params.derection,
            "units": {
                "value": params.units,
            },
            "order_type": "market"
        },

        leverage: {
            enabled: true,
            type: 'isolated',
            value: params.leverage
        },

        "take_profit": {
            "enabled": "true",
            "steps": [
                {
                    // Безубыточный выход
                    "order_type": "limit",
                    "price": {
                        "value": params.TPFirst_price,
                        "type": params.type_tp
                    },
                    "volume": "30.0",
                },
                {
                    // Основной TP
                    "order_type": params.TP_trailing ? 'limit' : 'market',
                    "price": {
                        "value": params.TP_price,
                        "type": params.type_tp
                    },
                    "volume": "35.0",
                    "trailing": {
                        "enabled": params.TP_trailing ? true : false,
                        "percent": params.TP_trailing
                    }
                },
                {
                    // Максимальный TP
                    "order_type": "limit",
                    "price": {
                        "value": params.TPMax_price,
                        "type": params.type_tp
                    },
                    "volume": "35.0",
                },
            ]
        },
        "stop_loss": {
            "enabled":  true,
            "breakeven": false,
            "order_type": "market",
            "conditional": { 
                "price": {
                    "value": params.SL_price,
                    // "percent": params.trailing,
                    "type": params.type_sl
                },
                trailing: {
                    enabled: true,
                    percent: params.SL_trailing
                }
            },
            timeout: {
                enabled: true,
                value: params.SL_sec // 60 секунд - время на проверку
            }
        }

    }).then((data) => {
        console.log('rt', data)
    })
}


// функция закрытия сделки по паре
export async function close_deal(params) {
    // получить все открытые сделки
    let pair_coin = params.pair.split('_')
    let dt = {
        account_id: params.account_id,
        status: 'active'
    }
    if (params.all !== true) {
        dt.pair = `${pair_coin[0]}_${pair_coin[1]}${pair_coin[0]}`
    }
    api.smartTradesV2(dt).then((data) => {
        // закрыть все открытые сделки
        data.forEach((item) => {
            api.closeByMarketSmartTradesV2(item.id).then((data) => {
                console.log('close', item.id)
            })
        })
        return true
    })

}




/*

// Поставил сделку на 4x
цена входа 1.600 

ROE 1% = 1.600 * 0.01 = 0.016 / 4 = 0.004 | 1.600 + 0.004 = 1.604

ROE 2% = 1.600 * 0.02 = 0.032 / 4 = 0.008 | 1.600 + 0.008 = 1.608

ROE 3% = 1.600 * 0.03 = 0.048 / 4 = 0.012 | 1.600 + 0.012 = 1.612


Цена выхода 1.590

ROE 1% = 1.590 * 0.01 = 0.0159 / 4 = 0.004 | 1.590 - 0.004 = 1.586
*/