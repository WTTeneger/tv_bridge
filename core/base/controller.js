export function getAlertData(req, res) {
    // Получить ID из :ID
    const { ID } = req.params;
    if (!ID) return res.status(400).json({
        status: 'error',
        message: 'ID is not defined',
    });
    console.log("ID", ID)
    console.log(req.body);
    let { coin, ticker, direction, price } = req.body;
    return res.json({
        status: 'ok',
    })
}