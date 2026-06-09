const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer <token>

  if (!token) {
    logger.warn(`Acceso sin token desde IP: ${req.ip} -> ${req.method} ${req.path}`);
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn(`Token expirado desde IP: ${req.ip}`);
      return res.status(401).json({ error: 'El token expiró, iniciá sesión nuevamente' });
    }
    logger.warn(`Token inválido desde IP: ${req.ip}`);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = { verifyToken };
