import 'dotenv/config';
import pino from 'pino';
import { createApp } from './app.js';

const logger = pino({ name: 'beautycx-api' });
const port = Number(process.env.PORT ?? 8080);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT: ${process.env.PORT}`);
}

const app = createApp();

app.listen(port, '0.0.0.0', () => {
  logger.info({ port }, 'API listening');
});
