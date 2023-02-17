// API BINANCE CLASS через fatch

class BinanceAPI {
    url = 'https://fapi.binance.com';
    constructor(apiKey, apiSecret) { 
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    // запросы к API
    async _request(method, path, params) {
        const url = this.url + path;
        const timestamp = Date.now();
        const query = Object.keys(params)
            .map(key => `${key}=${encodeURIComponent(params[key])}`)
            .join('&');
        const signature = crypto
            .createHmac('sha256', this.apiSecret)
            .update(query + timestamp)
            .digest('hex');
        const headers = { 
            'X-MBX-APIKEY': this.apiKey,
            'Content-Type': 'application/x-www-form-urlencoded',
        };
        const options = {
            method,
            headers,
        };
        if (method === 'GET') {
            const urlWithParams = `${url}?${query}&timestamp=${timestamp}&signature=${signature}`;
            const response = await fetch(urlWithParams, options);
            const result = await response.json();
            return result;
        }
        if (method === 'POST') {
            const urlWithParams = `${url}?timestamp=${timestamp}&signature=${signature}`;
            const response = await fetch(urlWithParams, {
                ...options,
                body: query,
            });
            const result = await response.json();
            return result;
        }
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
        
        const params = {
            symbol,
            side,
            quantity,
            price,
            type,
            timeInForce,
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
        const result = await this._request('GET', '/fapi/v2/balance', {});
        return result;
    }
}


export default BinanceAPI;