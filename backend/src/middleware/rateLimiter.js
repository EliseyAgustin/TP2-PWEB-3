const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Límite general: 100 requests cada 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit general alcanzado para IP: ${req.ip}`);
    res.status(429).json({ error: 'Demasiadas peticiones. Intentá nuevamente en 15 minutos.' });
  }
});

// Límite estricto para login: 5 intentos cada 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit de autenticación alcanzado para IP: ${req.ip}`);
    res.status(429).json({ error: 'Demasiados intentos de login. Esperá 15 minutos.' });
  }
});

module.exports = { generalLimiter, authLimiter };
