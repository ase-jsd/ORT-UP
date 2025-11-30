// middleware/rateLimit.js
import rateLimit from 'express-rate-limit';

const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 minute
const max = Number(process.env.RATE_LIMIT_MAX) || 15; // 15 requests per minute default

export default rateLimit({
  windowMs,
  max,
  message: { ok: false, error: 'Слишком много запросов. Попробуйте позднее.' }
});
