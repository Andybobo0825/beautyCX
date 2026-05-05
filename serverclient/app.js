import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import healthRouter from './routes/health.js';
import productsRouter from './routes/products.js';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*' }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/', (_req, res) => {
    res.json({ service: 'beautyCX API', status: 'ok' });
  });

  app.use('/health', healthRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/products', productsRouter);

  app.use((req, res) => {
    res.status(404).json({ error: 'not_found', path: req.path });
  });

  return app;
}
