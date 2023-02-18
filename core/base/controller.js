import BinanceAPI from "../../modules/binanceAPI.js";

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


    // Проверить, что все поля есть
    if (!coin || !exchange || !direction || !price) return res.status(400).json({
        status: 'error',
        message: 'Not all fields are defined',
    });
    // риск 7% по умолчанию
    if (!riskM) riskM = 7;

    // плечи по умолчанию 3
    if (!leverage) leverage = 3;

    let binance = new BinanceAPI(tokens_API[0], tokens_API[1]);

    // создаем бинанс связку

    direction = direction.toUpperCase();
    await binance.setLeverage(coin, leverage);
    // закрыть позицию
    var order = await binance.getOpenPositions(coin)
    // console.log(order);
    if (order.length > 0) {
        console.log("SELL");
        // console.log('order[0]', order[0]);
        let positionAmt = order[0].positionAmt;
        let DER = positionAmt > 0 ? "SELL" : "BUY"
        // сделать положительным
        let positionAmt_total = Math.abs(positionAmt);
        // console.log(positionAmt_total, positionAmt, DER);
        // закрываем ордер
        await binance.createOrder(coin, DER, positionAmt_total, 0, 'MARKET', 'GTC', false, true, 'CONTRACT_PRICE', false)
    }

    let balance = await binance.getBalance();
    let usdt_balance = balance.filter(item => item.asset === 'USDT')[0];
    // console.log('usdt_balance', usdt_balance, riskM);
    let total_for_trade = usdt_balance.availableBalance * (riskM / 100);

    // console.log(total_for_trade);

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
        

    console.log("BUY");
    // открыть позицию по направлению
    var order = await binance.createOrder(coin, direction, count_tokens, 0, 'MARKET', 'GTC', false, false, 'CONTRACT_PRICE', false)

    //

    return res.json({
        // coin_info,
        // precision,
        // balance.balance,
        // order_closed,
        status: 'ok',
        total_for_trade,
        count_tokens,
        // usdt_balance,
        // balance,
    })


}