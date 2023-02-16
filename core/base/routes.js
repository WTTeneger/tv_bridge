// роутер
// возвращает объект с методами для роутинга
import { Router } from 'express';
import { getAlertData } from './controller.js';

const router = Router();

// router.get('/TV/getAlert/', getAlert)
router.post('/TV/getAlert/:ID', getAlertData)

// 

export default router;