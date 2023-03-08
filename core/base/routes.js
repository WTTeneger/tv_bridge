// роутер
// возвращает объект с методами для роутинга
import { Router } from 'express';
import { getAlertData, setOrder, closeAll } from './controller.js';

const router = Router();

// router.get('/TV/getAlert/', getAlert)
router.post('/TV/getAlert/:ID', getAlertData)
router.post('/TV/setOrder/:ID', setOrder)
router.post('/TV/closeAll/:ID', closeAll)

// 

export default router;