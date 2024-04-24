import express from 'express';
import UpdateQuestion from '../controllers/Journal/UpdateQuestion';
import { authenticateToken } from '../middlewares/Authenticate';

const router = express.Router();

router.post('/edit', authenticateToken, UpdateQuestion);

export default router;
