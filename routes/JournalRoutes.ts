import express from 'express';
import JournalDetails from '../controllers/Journal/JournalDetails';
import JournalList from '../controllers/Journal/JournalList';
import { authenticateToken } from '../middlewares/Authenticate';

const router = express.Router();

router.get('/details', authenticateToken, JournalDetails);
router.get('/list', authenticateToken, JournalList);

export default router;
