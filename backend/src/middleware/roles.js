const logger = require('../utils/logger');

// Middleware de autorización por rol (RBAC)
const checkRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(
        `Acceso denegado: usuario "${req.user.username}" (rol: ${req.user.role}) intentó acceder a recurso de ${roles.join('/')}`
      );
      return res.status(403).json({ error: 'No tenés permisos para realizar esta acción' });
    }

    next();
  };
};

module.exports = { checkRole };
