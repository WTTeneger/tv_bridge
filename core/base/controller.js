export function getAlert(req, res) {
    console.log('getAlert');
    console.log(req.body);
    console.log(req.query);
    console.log(req.params);
    return res.json({
        status: 'ok',
    })
}