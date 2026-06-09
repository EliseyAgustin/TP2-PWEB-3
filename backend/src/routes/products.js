const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { products, categories } = require('../db/database');
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/roles');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/products - cualquier usuario autenticado puede ver el stock
router.get('/', verifyToken, (req, res) => {
  const all = products.findAll();
  res.json({ products: all, total: all.length });
});

// GET /api/products/low-stock - productos con stock bajo mínimo
router.get('/low-stock', verifyToken, (req, res) => {
  const low = products.findLowStock();
  res.json({ products: low, total: low.length });
});

// GET /api/products/:id
router.get('/:id', verifyToken, [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const product = products.findById(parseInt(req.params.id));
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json({ product });
});

// POST /api/products - solo admin
router.post('/', verifyToken, checkRole('admin'), [
  body('name').notEmpty().trim().withMessage('El nombre es requerido').isLength({ max: 100 }),
  body('quantity').isInt({ min: 0 }).withMessage('La cantidad debe ser un entero >= 0'),
  body('price').isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('ID de categoría inválido'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('El stock mínimo debe ser >= 0'),
  body('description').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { name, description, category_id, quantity, min_stock = 10, price } = req.body;

  if (category_id && !categories.findById(parseInt(category_id))) {
    return res.status(400).json({ error: 'La categoría especificada no existe' });
  }

  const product = products.create({
    name,
    description: description || null,
    category_id: category_id ? parseInt(category_id) : null,
    quantity: parseInt(quantity),
    min_stock: parseInt(min_stock),
    price: parseFloat(price)
  });

  logger.info(`Producto "${name}" creado por "${req.user.username}"`);
  res.status(201).json({ message: 'Producto creado exitosamente', product });
});

// PUT /api/products/:id - solo admin
router.put('/:id', verifyToken, checkRole('admin'), [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  body('name').optional().notEmpty().trim().withMessage('El nombre no puede estar vacío'),
  body('price').optional().isFloat({ min: 0 }).withMessage('El precio debe ser positivo'),
  body('min_stock').optional().isInt({ min: 0 }).withMessage('El stock mínimo debe ser >= 0'),
  body('category_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('ID de categoría inválido'),
  body('description').optional().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const id = parseInt(req.params.id);
  const existing = products.findById(id);
  if (!existing) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const updates = {};
  if (req.body.name !== undefined) updates.name = req.body.name;
  if (req.body.description !== undefined) updates.description = req.body.description;
  if (req.body.category_id !== undefined) updates.category_id = req.body.category_id ? parseInt(req.body.category_id) : null;
  if (req.body.min_stock !== undefined) updates.min_stock = parseInt(req.body.min_stock);
  if (req.body.price !== undefined) updates.price = parseFloat(req.body.price);

  const updated = products.update(id, updates);
  logger.info(`Producto ID ${id} actualizado por "${req.user.username}"`);
  res.json({ message: 'Producto actualizado correctamente', product: updated });
});

// DELETE /api/products/:id - solo admin
router.delete('/:id', verifyToken, checkRole('admin'), [
  param('id').isInt({ min: 1 }).withMessage('ID inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const id = parseInt(req.params.id);
  const product = products.findById(id);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  products.delete(id);
  logger.info(`Producto "${product.name}" eliminado por "${req.user.username}"`);
  res.json({ message: 'Producto eliminado correctamente' });
});

module.exports = router;
