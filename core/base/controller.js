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
    let { exchange, coin, direction, price } = req.body;

    // Проверить, что все поля есть
    if (!coin || !exchange || !direction || !price) return res.status(400).json({
        status: 'error',
        message: 'Not all fields are defined',
    });

    let binance = new BinanceAPI('lmTRpBu7E8AtRv5V79nesSKENGsRzjQ7PxzoHVEPd6rbwDTHWJXx5qrTHPzDxer2', '5sNtsrO3Gvt4vkxvDLue4GRtK0R2fVN9RMSDLidQ4pwYzdMwq4XU3SHglu7QuBRh');
    // купить 7% от баланса
    // gjkex
    // let res = await binance.createOrder(coin, direction, 0.001, price, 'LIMIT', 'GTC', false, false, 'CONTRACT_PRICE', false)

    let balance = await binance.getBalance();

    return res.json({
        status: 'ok',
        balance,
    })
}