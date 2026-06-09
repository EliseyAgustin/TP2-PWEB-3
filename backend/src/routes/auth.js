const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { users } = require('../db/database');
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// POST /api/auth/login
router.post('/login', authLimiter, [
  body('username').notEmpty().withMessage('El username es requerido').trim(),
  body('password').notEmpty().withMessage('La contraseña es requerida')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { username, password } = req.body;
  const user = users.findByUsername(username);

  if (!user || !bcrypt.compareSync(password, user.password)) {
    logger.warn(`Login fallido para "${username}" desde IP: ${req.ip}`);
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  logger.info(`Usuario "${username}" inició sesión`);
  res.json({
    message: 'Login exitoso',
    token,
    user: { id: user.id, username: user.username, email: user.email, role: user.role }
  });
});

// POST /api/auth/register - requiere estar autenticado
router.post('/register', verifyToken, [
  body('username')
    .notEmpty().trim()
    .isLength({ min: 3 }).withMessage('El username debe tener al menos 3 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Solo letras, números y guiones bajos'),
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role').optional().isIn(['admin', 'user']).withMessage('El rol debe ser "admin" o "user"')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { username, email, password, role = 'user' } = req.body;

  if (role === 'admin' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Solo un administrador puede crear otros administradores' });
  }

  if (users.findByUsernameOrEmail(username, email)) {
    return res.status(409).json({ error: 'El usuario o email ya está registrado' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = users.create({ username, email, password: hashedPassword, role });

  logger.info(`Usuario "${username}" registrado con rol "${role}" por "${req.user.username}"`);
  res.status(201).json({
    message: 'Usuario creado exitosamente',
    user: { id: newUser.id, username, email, role }
  });
});

// GET /api/auth/me - datos del usuario actual
router.get('/me', verifyToken, (req, res) => {
  const user = users.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

module.exports = router;
