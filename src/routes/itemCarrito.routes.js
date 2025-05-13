const express = require('express');
const router = express.Router();
const itemCarritoController = require('../controllers/itemCarrito.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verificarToken);

// Rutas de items de carrito
router.post('/', itemCarritoController.agregarItem);
router.put('/:id', itemCarritoController.actualizarCantidad);
router.delete('/:id', itemCarritoController.eliminarItem);

module.exports = router;