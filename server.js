// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pino from 'pino';
import routes from './routes/ai.js';
import rateLimiter from './middleware/rateLimit.js';

dotenv.config();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const app = express();
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*' // production: set specific origin
}));
app.use(express.json({ limit: '30kb' }));

// simple rate limiter on all routes
app.use(rateLimiter);

app.get('/', (req, res) => res.json({ ok: true, message: 'ORT StudyPlan AI backend' }));

app.use('/api', routes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  logger.info(`Server listening on port ${port}`);
});
