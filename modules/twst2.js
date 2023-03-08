import stringify from "qs-stringify"
import crypto from "crypto"
import fetch from "node-fetch"




let payload = {
    "account_id": 32249456,
    "pair": 'USDT_HOOK',
    "position": {
        "type": 'buy',
        "units": {
            "value": "10"
        },
        "order_type": "market"
    },

    "take_profit": {
        "enabled": "true",
        "steps": [
            {
                "order_type": "limit",
                "price": {
                    "value": 1.95 * 1.015,
                    "type": "ask",
                },
                "volume": "100.0"
            },
        ]
    },
    "stop_loss": {
        "enabled": "false",
    }
}

class API {
    constructor(key, secret) {
        this.key = key;
        this.secret = secret;
        this.baseURL = 'https://api.3commas.io/';
        this.version = 'v2';
        this.retryStatusCodes = [500, 502, 503, 504];
        this.retryCount = 3;
        this.timeout = 30000;
    }

    async makeRequest(httpMethod, path, params, payload, additionalHeaders, retryCount = 0) {
        let entity = path.split('/')[0];
        if (entity in ['entity1', 'entity2']) {
            path = path.replace('_v2', '');
            this.version = 'v2';
        }
        let relativeURL = `${path}`;
        if (params && Object.keys(params).length > 0) {
            const paramString = new URLSearchParams(params).toString();
            relativeURL = `${paramString}`;
        }

        console.log(relativeURL);
        let body = null;
        if (httpMethod === 'GET' || (payload && Object.keys(payload).length === 0)) {
            body = null;
        } else {
            body = JSON.stringify(payload);
        }
        const signature = this.generateSignature(relativeURL, body || '');
        const absoluteURL = `${this.baseURL}${relativeURL}`;
        try {
            const response = await fetch(absoluteURL, {
                method: httpMethod,
                headers: {
                    'APIKEY': this.key,
                    'Signature': signature,
                    ...additionalHeaders
                },
                body,
                timeout: this.timeout
            });
            console.log(absoluteURL);
            const responseJson = await response.json();
            if (responseJson.error) {
                const errorStatusCode = responseJson.error.status_code;
                if (this.retryStatusCodes.includes(errorStatusCode) && retryCount < this.retryCount) {
                    return this.makeRequest(httpMethod, path, params, payload, additionalHeaders, retryCount + 1);
                } else {
                    responseJson.status_code = errorStatusCode;
                    return [responseJson, {}];
                }
            } else {
                return [{}, responseJson];
            }
        } catch (err) {
            let error = { error: true, msg: `Other error occurred: ${err.message}`, status_code: null };
            if (err.response) {
                error.status_code = err.response.status;
            }
            return [error, {}];
        }
    }

    generateSignature(path, data) {
        const encodedKey = Buffer.from(this.secret, 'utf8');
        const message = Buffer.from(`${path}${data}`, 'utf8');
        const signature = crypto
            .createHmac('sha256', encodedKey)
            .update(message)
            .digest('hex');
        return signature;
    }
}



let api = new API(
    '54526ece1ca04e71bf35fa98fc88d19703076483900c468bb3d666349685032a',
    '3b0439be408503039e0000f5a2c3fc2f118b337abadac3be53f411168d0306062d1ee50bc1430247cd4bd3c2b27eb620c976c950b468b240afe77d3d05dffd492c4f65c619cfb09f3daf8499a54f2f3cb18005fa8cf04d5f118d0e6d33b004baba4afa5a'
)

let a = await api.makeRequest(
    "POST",
    'public/api/v2/smart_trades_v2',
    {},
    payload
)

console.log(a);