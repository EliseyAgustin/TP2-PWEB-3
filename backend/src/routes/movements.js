const express = require('express');
const { body, param, validationResult } = require('express-validator');
const { movements, products } = require('../db/database');
const { verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// GET /api/movements - historial (últimos 100)
router.get('/', verifyToken, (req, res) => {
  const all = movements.findAll();
  res.json({ movements: all, total: all.length });
});

// GET /api/movements/product/:productId - movimientos de un producto
router.get('/product/:productId', verifyToken, [
  param('productId').isInt({ min: 1 }).withMessage('ID de producto inválido')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const productId = parseInt(req.params.productId);
  const product = products.findById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const productMovements = movements.findByProductId(productId);
  res.json({ product_name: product.name, movements: productMovements, total: productMovements.length });
});

// POST /api/movements - registrar entrada o salida (admin y user)
router.post('/', verifyToken, [
  body('product_id').isInt({ min: 1 }).withMessage('ID de producto requerido'),
  body('type').isIn(['entrada', 'salida']).withMessage('El tipo debe ser "entrada" o "salida"'),
  body('quantity').isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  body('description').optional().trim().isLength({ max: 200 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { product_id, type, quantity, description } = req.body;
  const productId = parseInt(product_id);
  const qty = parseInt(quantity);

  const product = products.findById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  if (type === 'salida' && product.quantity < qty) {
    return res.status(400).json({
      error: `Stock insuficiente. Stock actual: ${product.quantity} unidades, solicitado: ${qty}`
    });
  }

  const newQuantity = type === 'entrada' ? product.quantity + qty : product.quantity - qty;

  const movement = movements.create(
    {
      product_id: productId,
      type,
      quantity: qty,
      description: description || null,
      user_id: req.user.id
    },
    newQuantity
  );

  logger.info(
    `Movimiento: ${type} de ${qty} uds. de "${product.name}" por "${req.user.username}". Stock: ${product.quantity} -> ${newQuantity}`
  );

  res.status(201).json({
    message: 'Movimiento registrado exitosamente',
    movement: {
      id: movement.id,
      product_id: productId,
      product_name: product.name,
      type,
      quantity: qty,
      description,
      stock_anterior: product.quantity,
      stock_nuevo: newQuantity
    }
  });
});

module.exports = router;
