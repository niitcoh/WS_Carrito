const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verificarToken);

// Rutas de carrito
router.get('/activo', carritoController.getCarritoActivo);
router.get('/', carritoController.getAllCarritos);
router.get('/:id', carritoController.getCarritoById);
router.post('/:id/vaciar', carritoController.vaciarCarrito);
router.post('/:id/abandonar', carritoController.abandonarCarrito);
router.post('/:id/procesar', carritoController.procesarCarrito);

module.exports = router;