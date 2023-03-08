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
    TP_percent: 0.6
}

// Создание сделки по паре
export async function create_deal(params) {
    let binance_pair = _params.pair.split('_')[1] + _params.pair.split('_')[0]

    // получить цену валютной пары
    let price_pair = 0
    await api.getPairsBids({
        symbol: binance_pair,
        limit: 20
    }).then((data) => {
        price_pair = parseFloat(_params.derection == 'sell' ? data.bids[0][0] : data.asks[0][0])
    })

    // расчет доп шагов цены для SL и TP
    let psl = parseFloat(price_pair * ((0.01 * _params.SL_percent) / _params.leverage))
    let ptp = parseFloat(price_pair * ((0.01 * _params.TP_percent) / _params.leverage))


    // расчет цены на которую нужно ставить SL и TP
    _params.SL_price = _params.derection == 'buy' ? price_pair - psl : price_pair + psl
    _params.TP_price = _params.derection == 'buy' ? price_pair + ptp : price_pair - ptp

    console.log(_params.SL_price, _params.TP_price, price_pair);

    // return true
    api.createSmartTradesV2({
        "account_id": _params.account_id,
        "pair": _params.pair,
        "position": {
            "type": _params.derection,
            "units": {
                "value": _params.units,
            },
            "order_type": "market"
        },

        leverage: {
            enabled: true,
            type: 'isolated',
            value: _params.leverage
        },

        "take_profit": {
            "enabled": "true",
            "steps": [
                {
                    "order_type": "market",
                    "price": {
                        "value": _params.TP_price,
                        "type": "bid"
                    },
                    "volume": "100.0",
                    "trailing": {
                        "enabled": "true",
                        "percent": _params.trailing
                    }
                }
            ]
        },
        "stop_loss": {
            "enabled": "true",
            "breakeven": "false",
            "order_type": "market",
            "conditional": { // conditional stop loss - if price is lower than 1.97, then place stop loss order
                "price": {
                    "value": _params.SL_price,
                    "type": "bid"
                },
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
