// routes/ai.js
import express from 'express';
import { z } from 'zod';
import pino from 'pino';
import { generateStudyPlan } from '../lib/openai.js';
import validateBody from '../middleware/validate.js';

const logger = pino();
const router = express.Router();

/**
 * Schema for the incoming request body
 * fields correspond to the frontend form
 */
const ProfileSchema = z.object({
  name: z.string().max(60).optional().or(z.literal('')),
  grade: z.string().max(10).optional().or(z.literal('')),
  examDate: z.string().optional().or(z.literal('')),
  daysPerWeek: z.union([z.string(), z.number()]).optional(),
  hoursPerDay: z.union([z.string(), z.number()]).optional(),
  strengths: z.string().optional().or(z.literal('')),
  weaknesses: z.string().optional().or(z.literal('')),
  goalScore: z.union([z.string(), z.number()]).optional(),
  resources: z.string().optional().or(z.literal(''))
});

/**
 * POST /api/generate-study-plan
 * Body: { profile: {...} }
 */
router.post(
  '/generate-study-plan',
  validateBody(z.object({ profile: ProfileSchema })),
  async (req, res) => {
    try {
      const { profile } = req.body;
      // basic sanitization / defaults
      const profileClean = {
        name: profile.name || 'Ученик',
        grade: profile.grade || '9',
        examDate: profile.examDate || '',
        daysPerWeek: profile.daysPerWeek || 5,
        hoursPerDay: profile.hoursPerDay || 2,
        strengths: profile.strengths || 'не указаны',
        weaknesses: profile.weaknesses || 'не указаны',
        goalScore: profile.goalScore || 'не указано',
        resources: profile.resources || 'онлайн-ресурсы и учебники'
      };

      // Build prompt for OpenAI (in Russian as required)
      const prompt = buildPrompt(profileClean);

      const aiResponse = await generateStudyPlan(prompt);

      res.json({ ok: true, plan: aiResponse });
    } catch (err) {
      logger.error(err, 'Failed to generate plan');
      res.status(500).json({ ok: false, error: 'Ошибка сервера при генерации плана' });
    }
  }
);

function buildPrompt(data) {
  return `
Студент:
- Имя: ${data.name}
- Класс: ${data.grade}
- Дата экзамена: ${data.examDate || 'не указана'}
- Дней в неделю для учёбы: ${data.daysPerWeek}
- Часов в день: ${data.hoursPerDay}
- Сильные стороны: ${data.strengths}
- Слабые стороны: ${data.weaknesses}
- Целевой балл: ${data.goalScore}
- Ресурсы: ${data.resources}

Инструкции для AI:
Ты — образовательный наставник, который составляет пошаговый, реалистичный и подробный план подготовки к экзамену ORT.
Требования:
1) Напиши мотивационный вступительный абзац (1-2 предложения).
2) Список ключевых приоритетов для подготовки.
3) Еженедельный план (Week 1, Week 2, ... до дня экзамена) с ежедневными заданиями.
4) Предложи тайм-блоки (сколько минут на теорию, упражнения, тесты).
5) Дай 3 шага «что делать каждый день».
6) Добавь чек-лист за 3 дня до экзамена и в день экзамена.
7) Рекомендованные бесплатные ресурсы (Khan Academy, Coursera, YouTube playlist и т.д.)
8) Ответ дай на русском языке.
9) Формат ответа: четкими заголовками и списками (markdown-like).

Данные студента: ${JSON.stringify(data)}
`;
}

export default router;
