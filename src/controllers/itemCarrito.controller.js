const Carrito = require('../models/carrito.model');
const ItemCarrito = require('../models/itemCarrito.model');
const ProductosService = require('../services/productos.service');

exports.agregarItem = async (req, res) => {
  try {
    const { producto_id, cantidad } = req.body;
    const usuarioId = req.user.id;
    
    if (!producto_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'ID de producto y cantidad positiva son requeridos' });
    }
    
    // Verificar si el producto existe y tiene stock disponible
    const stockInfo = await ProductosService.checkStock(producto_id, cantidad);
    
    if (!stockInfo.disponible) {
      return res.status(400).json({ 
        message: 'Stock insuficiente',
        stockActual: stockInfo.stock || 0,
        cantidadSolicitada: cantidad
      });
    }
    
    // Obtener carrito activo o crear uno nuevo
    let carrito = await Carrito.getActiveByUserId(usuarioId);
    
    if (!carrito) {
      const nuevoCarritoId = await Carrito.create(usuarioId);
      carrito = await Carrito.getById(nuevoCarritoId);
    }
    
    // Agregar item al carrito
    await ItemCarrito.add(carrito.id, producto_id, cantidad, stockInfo.precio);
    
    // Recalcular el total del carrito
    const total = await Carrito.calculateTotal(carrito.id);
    await Carrito.updateTotal(carrito.id, total);
    
    // Obtener carrito actualizado con items
    const carritoActualizado = await Carrito.getById(carrito.id);
    const items = await ItemCarrito.getAllByCartId(carrito.id);
    
    res.status(200).json({
      message: 'Producto agregado al carrito exitosamente',
      carrito: carritoActualizado,
      items: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al agregar item al carrito' });
  }
};

exports.actualizarCantidad = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { cantidad } = req.body;
    const usuarioId = req.user.id;
    
    if (!cantidad || cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser positiva' });
    }
    
    // Obtener el item
    const item = await ItemCarrito.getById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }
    
    // Verificar que el carrito pertenezca al usuario
    const carrito = await Carrito.getById(item.carrito_id);
    
    if (!carrito || carrito.usuario_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este item' });
    }
    
    // Verificar stock disponible
    const stockInfo = await ProductosService.checkStock(item.producto_id, cantidad);
    
    if (!stockInfo.disponible) {
      return res.status(400).json({ 
        message: 'Stock insuficiente',
        stockActual: stockInfo.stock,
        cantidadSolicitada: cantidad
      });
    }
    
    // Actualizar cantidad
    await ItemCarrito.updateQuantity(itemId, cantidad, item.precio_unitario);
    
    // Recalcular el total del carrito
    const total = await Carrito.calculateTotal(carrito.id);
    await Carrito.updateTotal(carrito.id, total);
    
    // Obtener carrito actualizado con items
    const carritoActualizado = await Carrito.getById(carrito.id);
    const items = await ItemCarrito.getAllByCartId(carrito.id);
    
    res.status(200).json({
      message: 'Cantidad actualizada exitosamente',
      carrito: carritoActualizado,
      items: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar cantidad' });
  }
};

exports.eliminarItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const usuarioId = req.user.id;
    
    // Obtener el item
    const item = await ItemCarrito.getById(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Item no encontrado' });
    }
    
    // Verificar que el carrito pertenezca al usuario
    const carrito = await Carrito.getById(item.carrito_id);
    
    if (!carrito || carrito.usuario_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este item' });
    }
    
    // Eliminar el item
    await ItemCarrito.remove(itemId);
    
    // Recalcular el total del carrito
    const total = await Carrito.calculateTotal(carrito.id);
    await Carrito.updateTotal(carrito.id, total);
    
    // Obtener carrito actualizado con items
    const carritoActualizado = await Carrito.getById(carrito.id);
    const items = await ItemCarrito.getAllByCartId(carrito.id);
    
    res.status(200).json({
      message: 'Item eliminado exitosamente',
      carrito: carritoActualizado,
      items: items
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar item' });
  }
};