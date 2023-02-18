import BinanceAPI from "../../modules/binanceAPI.js";


export async function getAlertData(req, res) {
    // Получить ID из :ID
    const { ID } = req.params;
    if (!ID) return res.status(400).json({
        status: 'error',
        message: 'ID is not defined',
    });
    console.log("ID", ID)
    console.log(req.body);
    let { exchange, coin, direction, price, riskM } = req.body;


    // Проверить, что все поля есть
    if (!coin || !exchange || !direction || !price) return res.status(400).json({
        status: 'error',
        message: 'Not all fields are defined',
    });
    // риск 7% по умолчанию
    if (!riskM) riskM = 7;

    let binance = new BinanceAPI('lmTRpBu7E8AtRv5V79nesSKENGsRzjQ7PxzoHVEPd6rbwDTHWJXx5qrTHPzDxer2', '5sNtsrO3Gvt4vkxvDLue4GRtK0R2fVN9RMSDLidQ4pwYzdMwq4XU3SHglu7QuBRh');
    // купить 7% от баланса
    // let res = await binance.createOrder(coin, direction, 0.001, price, 'LIMIT', 'GTC', false, false, 'CONTRACT_PRICE', false)

    let balance = await binance.getBalance();
    // получить баланс USDT
    let usdt_balance = balance.filter(item => item.asset === 'USDT')[0];

    let total_for_trade = usdt_balance.availableBalance * (riskM / 100);

    // открыть сделку на покупку 7% от баланса
    // var order = await binance.createOrder(coin, direction, total_for_trade / price, price, 'LIMIT', 'GTC', false, false, 'CONTRACT_PRICE', false)

    return res.json({
        // order,
        status: 'ok',
        total_for_trade,
        usdt_balance,
        // balance,
    })


}