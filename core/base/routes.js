// роутер
// возвращает объект с методами для роутинга
import { Router } from 'express';
import { getAlert } from './controller.js';

const router = Router();

router.get('/TV/getAlert/sl', getAlert)

export default router;