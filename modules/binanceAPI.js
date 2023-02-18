// API BINANCE CLASS через fatch
import crypto from 'crypto';
import fetch from 'node-fetch';
import querystring from 'querystring';
import axios from 'axios';
class BinanceAPI {
    constructor(API_KEY, API_SECRET, futures = true, test_net=false) {
        this.API_KEY = test_net ? 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A' : API_KEY;
        this.API_SECRET = test_net ? 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j' : API_SECRET;
        this.futures = futures;
        this.base_url = test_net ? 'https://testnet.binancefuture.com' : this.futures ? 'https://fapi.binance.com' : 'https://api.binance.com'  ;
        this.shift_seconds = 1;
        this.methods = {
            getFuturesBalance: {
                url: '/fapi/v2/balance',
                method: 'GET',
                private: true
            },
            createFuturesOrder: {
                url: '/fapi/v1/order',
                method: 'POST',
                private: true
            },
            setLeverage: {
                url: '/fapi/v1/leverage',
                method: 'POST',
                private: true
            },
            getOpenOrders: {
                url: '/fapi/v1/openOrders',
                method: 'GET',
                private: true
            },
            getOpenPositions: {
                url: '/fapi/v2/positionRisk',
                method: 'GET',
                private: true
            },
            getCoinInfo: {
                url: '/fapi/v1/exchangeInfo',
                method: 'GET',
                private: false
            },


            // define your methods here
        };

        // console.log(this.base_url);
    }

    async request(command, kwargs = {}) {
        const method = this.methods[command].method;
        let payloadStr = querystring.stringify(kwargs);
        const timestamp = Date.now() - this.shift_seconds * 1000;
        let api_url = this.base_url + this.methods[command].url
        let signature = '';
        if (this.methods[command].private) {
            kwargs.timestamp = timestamp; // добавляем сдвиг в секундах для синхронизации времени на сервере и на клиенте
            payloadStr = querystring.stringify(kwargs);
            signature = crypto.createHmac('sha256', this.API_SECRET).update(payloadStr).digest('hex');
            payloadStr += `&signature=${signature}`;
            kwargs.signature = signature;
        }

        const url = this.base_url + this.methods[command].url;
        const headers = {
            'X-MBX-APIKEY': this.API_KEY,
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const options = {
            method,
            headers,
        };
        if (method !== 'GET') {
            options.params = kwargs
        } else {
            api_url += '?' + payloadStr;
        }

        // console.log(api_url, options);
        let data;
        if (method === 'GET') {
            await axios.get(api_url, options).then(response => {
                // записываем в переменную data ответ от сервера в виде объекта который он прислал
                data = response.data;
            }).catch(error => {
                console.error(error.response.data);
                // data = error.response.data;
            });
        }
        if (method === 'POST') {
            await axios.post(api_url, null, options).then(response => {
                // записываем в переменную data ответ от сервера в виде объекта который он прислал
                data = response.data.data;
            }).catch(error => { 
                console.error(error.response.data);
                // data = error.response.data;
            });
        }
        // console.log('data', data);


        return data;
    }

    // поставить плечи на фючерсах 3x
    async setLeverage(symbol, leverage) { 
        const params = {
            symbol,
            leverage
        };
        const result = await this.request('setLeverage', params);
        return result;
    }

    // создание сделки на покупку futures с 3 плечами
    async createOrder(symbol, side, quantity, price, type, timeInForce, reduceOnly, closePosition, workingType, priceProtect) {
        /*
        symbol: 'BTCUSDT', // это пара 
        side: 'BUY', // это направление
        quantity: 0.001, // это объем
        price: 10000, // это цена
        type: 'LIMIT', // это тип
        timeInForce: 'GTC', // это время жизни
        reduceOnly: false, 
        closePosition: false, // при true закрывает позицию
        workingType: 'CONTRACT_PRICE', // это 
        priceProtect: false // это не работает
        */

        // оставить у quantity 4 знака после запятой
        // quantity = quantity.toFixed(3);
        let params;
        if (closePosition == true) {
            params = {
                symbol,
                side,
                type,
                // timeInForce,
                quantity,
                // price,
                // reduceOnly,
                // closePosition,
                // workingType,
                // priceProtect
            };
        } else {
            params = {
                symbol,
                side,
                type,
                // timeInForce,
                quantity,
                // price,
                // reduceOnly,
                // closePosition,
                // workingType,
                // priceProtect
            };
        }
        const result = await this.request('createFuturesOrder', params);
        return result;

    }

    // закрыть позицию на фючерсах
    async closePosition(symbol) { 
        const params = {
            symbol,
            side: 'SELL',
            type: 'MARKET',
            quantity: 0.001
        };
        const result = await this.request('createFuturesOrder', params);
        return result;
    }

    // получить информацию сколько у монеты знаков после запятой
    async getCoinInfo(symbol) {
        const params = {
            symbol
        };
        const result = await this.request('getCoinInfo', params);
        return result;
    }
    
    // получить все открытые ордера на фючерсах
    async getOpenOrders(symbol) {
        const params = {
            symbol
        };
        const result = await this.request('getOpenOrders', params);
        return result;
    }    
    // получить все открытые позиции на фючерсах
    async getOpenPositions(symbol) {
        const params = {
            symbol
        };
        const result = await this.request('getOpenPositions', params);
        return result;
    }
    // получить баланс на фючерсах
    async getBalance() {
        const result = await this.request('getFuturesBalance', {});
        return result;
    }
}


export default BinanceAPI;
