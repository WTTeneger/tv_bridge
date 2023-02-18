// API BINANCE CLASS через fatch
import crypto from 'crypto';
import fetch from 'node-fetch';
import querystring from 'querystring';
class BinanceAPI {
    constructor(API_KEY, API_SECRET, futures = true, test_net=false) {
        this.API_KEY = test_net ? 'vmPUZE6mv9SD5VNHk4HlWFsOr6aKE2zvsw0MuIgwCIPy6utIco14y7Ju91duEh8A' : API_KEY;
        this.API_SECRET = test_net ? 'NhqPtmdSJYdKjVHjA7PZj4Mge3R5YNiP1e3UZjInClVN65XAbvqqM6A7H5fATj0j' : API_SECRET;
        this.futures = futures;
        this.base_url = test_net ? 'https://testnet.binancefuture.com' : this.futures ? 'https://fapi.binance.com/' : 'https://api.binance.com/'  ;
        this.shift_seconds = 0;
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
            // define your methods here
        };

        // console.log(this.base_url);
    }

    async request(command, kwargs = {}) {
        const method = this.methods[command].method;
        let payloadStr = querystring.stringify(kwargs);

        if (this.methods[command].private) {
            const timestamp = Date.now();
            kwargs.timestamp = timestamp - this.shift_seconds - 1;
            payloadStr = querystring.stringify(kwargs);
            const signature = crypto.createHmac('sha256', this.API_SECRET).update(payloadStr).digest('hex');
            payloadStr += `&signature=${signature}`;

            console.log('payloadStr', payloadStr);
        }

        const url = this.base_url + this.methods[command].url;
        const headers = {
            'X-MBX-APIKEY': this.API_KEY
        };

        const options = {
            method,
            headers,
            body: method === 'GET' ? undefined : payloadStr
        };
        
        const response = await fetch(method === 'GET' ? url + '?' + payloadStr : url, options);

        if (!response.ok) {
            const errorResponse = await response.text();
            throw new Error(`Binance API error: ${errorResponse}`);
        }

        const data = await response.json();
        console.log(data);
        if (data.code) {
            throw new Error(`Binance API error: ${data.msg}`);
        }

        return data;
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
        closePosition: false, 
        workingType: 'CONTRACT_PRICE', // это 
        priceProtect: false // это не работает
        */

        // symbol=BTCUSDT&side=BUY&type=LIMIT&timeInForce=GTC&quantity=1&price=0.1&recvWindow=5000&timestamp=1499827319559
        // symbol=HOOKUSDT&side=buy&type=LIMIT&timeInForce=GTC&quantity=0.5253205963254592&price=2.6670000000000003&timestamp=1676660358124&recvWindow=5000
        const params = {
            symbol,
            side,
            type,
            timeInForce,
            quantity,
            price,
            reduceOnly,
            closePosition,
            workingType,
            priceProtect
        };
        const result = await this._request('POST', '/fapi/v1/order', params);
        return result;

    }

    // получить баланс на фючерсах
    async getBalance() {
        const result = await this.request('getFuturesBalance', {});
        return result;
    }
}


export default BinanceAPI;
