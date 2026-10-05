import express from 'express';
import { getOverview, getTrends, getEnvironment, getCommunity } from '../controllers/insights.controller.js';

const router = express.Router();

router.get('/overview', getOverview);
router.get('/trends', getTrends);
router.get('/environment', getEnvironment);
router.get('/community', getCommunity);

export default router;
