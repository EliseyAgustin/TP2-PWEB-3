// Middleware de sanitización para prevenir XSS
// Escapa caracteres HTML peligrosos en los inputs de tipo string

const SKIP_FIELDS = ['password']; // No sanitizar campos sensibles que no se muestran

const sanitizeString = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

const sanitizeObject = (obj) => {
  const result = {};
  for (const key in obj) {
    if (SKIP_FIELDS.includes(key)) {
      result[key] = obj[key];
    } else if (typeof obj[key] === 'string') {
      result[key] = sanitizeString(obj[key]);
    } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      result[key] = sanitizeObject(obj[key]);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
};

const sanitizeMiddleware = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  next();
};

module.exports = sanitizeMiddleware;
