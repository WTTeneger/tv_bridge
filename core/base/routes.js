// роутер
// возвращает объект с методами для роутинга
import { Router } from 'express';
import { getAlert } from './controller.js';

const router = Router();

// router.get('/TV/getAlert/', getAlert)
router.post('/TV/getAlert/:ID', getAlert)

// 

export default router;