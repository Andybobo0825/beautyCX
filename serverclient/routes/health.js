import { Router } from 'express';
import { getPortfolioStats } from '../services/products.js';

const router = Router();

router.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'beautycx-api' });
});

router.get('/ready', (_req, res) => {
  try {
    res.json({ status: 'ready', database: 'ok', stats: getPortfolioStats() });
  } catch (error) {
    res.status(503).json({ status: 'not_ready', database: 'error', message: error.message });
  }
});

export default router;
