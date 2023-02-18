import axios from 'axios';
import crypto from 'crypto';


const endpoint = 'https://fapi.binance.com';
const apiKey = 'lmTRpBu7E8AtRv5V79nesSKENGsRzjQ7PxzoHVEPd6rbwDTHWJXx5qrTHPzDxer2';
const secretKey = '5sNtsrO3Gvt4vkxvDLue4GRtK0R2fVN9RMSDLidQ4pwYzdMwq4XU3SHglu7QuBRh';

const symbol = 'BTCUSDT';
const side = 'BUY';
const type = 'LIMIT';
const timeInForce = 'GTC';
const quantity = 1;
const price = 50000;

const timestamp = Date.now();

const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`symbol=${symbol}&side=${side}&type=${type}&timeInForce=${timeInForce}&quantity=${quantity}&price=${price}&timestamp=${timestamp}`)
    .digest('hex');

const config = {
    headers: {
        'X-MBX-APIKEY': apiKey
    },
    params: {
        symbol: symbol,
        side: side,
        type: type,
        timeInForce: timeInForce,
        quantity: quantity,
        price: price,
        timestamp: timestamp,
        signature: signature
    }
};

axios.post(`${endpoint}/fapi/v1/order`, null, config)
    .then(response => {
        console.log(response.data);
    })
    .catch(error => {
        console.error(error.response.data);
    });