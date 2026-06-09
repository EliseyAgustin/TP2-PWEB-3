const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { categories } = require('../db/database');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roles');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/categories - todos los autenticados pueden ver
router.get('/', verifyToken, (req, res) => {
  res.json({ categories: categories.findAll() });
});

// POST /api/categories - solo admin
router.post('/', verifyToken, checkRole('admin'), [
  body('name').notEmpty().trim().withMessage('El nombre es requerido').isLength({ max: 50 }),
  body('description').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { name, description } = req.body;

  if (categories.findByName(name)) {
    return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
  }

  const category = categories.create({ name, description: description || null });
  logger.info(`Categoría "${name}" creada por "${req.user.username}"`);
  res.status(201).json({ message: 'Categoría creada exitosamente', category });
});

// DELETE /api/categories/:id - solo admin
router.delete('/:id', verifyToken, checkRole('admin'), [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const id = parseInt(req.params.id);
  const category = categories.findById(id);
  if (!category) {
    return res.status(404).json({ error: 'Categoría no encontrada' });
  }

  if (categories.hasProducts(id)) {
    return res.status(400).json({ error: 'No se puede eliminar una categoría que tiene productos asociados' });
  }

  categories.delete(id);
  logger.info(`Categoría "${category.name}" eliminada por "${req.user.username}"`);
  res.json({ message: 'Categoría eliminada correctamente' });
});

module.exports = router;
