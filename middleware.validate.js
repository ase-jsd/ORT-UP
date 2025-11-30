// middleware/validate.js
export default function validateBody(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.validated = parsed;
      next();
    } catch (err) {
      return res.status(400).json({ ok: false, error: 'Неправильный формат входных данных', details: err.errors || err.message });
    }
  };
}
