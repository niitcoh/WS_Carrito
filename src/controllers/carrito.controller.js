const Carrito = require('../models/carrito.model');
const ItemCarrito = require('../models/itemCarrito.model');
const ProductosService = require('../services/productos.service');

exports.getCarritoActivo = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    // Obtener carrito activo o crear uno nuevo
    let carrito = await Carrito.getActiveByUserId(usuarioId);
    
    if (!carrito) {
      const nuevoCarritoId = await Carrito.create(usuarioId);
      carrito = await Carrito.getById(nuevoCarritoId);
    }
    
    // Obtener los items del carrito
    const items = await ItemCarrito.getAllByCartId(carrito.id);
    
    // Obtener información detallada de los productos
    const itemsConDetalles = await Promise.all(items.map(async (item) => {
      const productoDetalle = await ProductosService.getProductDetails(item.producto_id);
      return {
        ...item,
        producto: productoDetalle
      };
    }));
    
    res.status(200).json({
      carrito,
      items: itemsConDetalles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
};

exports.getAllCarritos = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    
    const carritos = await Carrito.getAllByUserId(usuarioId);
    
    res.status(200).json(carritos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los carritos' });
  }
};

exports.getCarritoById = async (req, res) => {
  try {
    const carritoId = req.params.id;
    const usuarioId = req.user.id;
    
    const carrito = await Carrito.getById(carritoId);
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    // Verificar que el carrito pertenezca al usuario
    if (carrito.usuario_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este carrito' });
    }
    
    // Obtener los items del carrito
    const items = await ItemCarrito.getAllByCartId(carritoId);
    
    // Obtener información detallada de los productos
    const itemsConDetalles = await Promise.all(items.map(async (item) => {
      const productoDetalle = await ProductosService.getProductDetails(item.producto_id);
      return {
        ...item,
        producto: productoDetalle
      };
    }));
    
    res.status(200).json({
      carrito,
      items: itemsConDetalles
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el carrito' });
  }
};

exports.vaciarCarrito = async (req, res) => {
  try {
    const carritoId = req.params.id;
    const usuarioId = req.user.id;
    
    const carrito = await Carrito.getById(carritoId);
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    // Verificar que el carrito pertenezca al usuario
    if (carrito.usuario_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este carrito' });
    }
    
    await ItemCarrito.removeAllFromCart(carritoId);
    
    // Actualizar el total a 0
    await Carrito.updateTotal(carritoId, 0);
    
    res.status(200).json({ message: 'Carrito vaciado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al vaciar el carrito' });
  }
};

exports.abandonarCarrito = async (req, res) => {
  try {
    const carritoId = req.params.id;
    const usuarioId = req.user.id;
    
    const carrito = await Carrito.getById(carritoId);
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    // Verificar que el carrito pertenezca al usuario
    if (carrito.usuario_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para modificar este carrito' });
    }
    
    // Cambiar estado a abandonado
    await Carrito.updateStatus(carritoId, 'abandonado');
    
    // Crear un nuevo carrito activo
    await Carrito.create(usuarioId);
    
    res.status(200).json({ message: 'Carrito abandonado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al abandonar el carrito' });
  }
};

exports.procesarCarrito = async (req, res) => {
  try {
    const carritoId = req.params.id;
    const usuarioId = req.user.id;
    
    const carrito = await Carrito.getById(carritoId);
    
    if (!carrito) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }
    
    // Verificar que el carrito pertenezca al usuario
    if (carrito.usuario_id !== usuarioId) {
      return res.status(403).json({ message: 'No tienes permiso para procesar este carrito' });
    }
    
    if (carrito.estado !== 'activo') {
      return res.status(400).json({ message: 'Solo se pueden procesar carritos activos' });
    }
    
    // Verificar stock de todos los productos
    const items = await ItemCarrito.getAllByCartId(carritoId);
    
    if (items.length === 0) {
      return res.status(400).json({ message: 'El carrito está vacío' });
    }
    
    // Verificar stock disponible
    for (const item of items) {
      const stockInfo = await ProductosService.checkStock(item.producto_id, item.cantidad);
      
      if (!stockInfo.disponible) {
        return res.status(400).json({ 
          message: `Stock insuficiente para el producto ${item.producto_id}`,
          stockActual: stockInfo.stock,
          cantidadSolicitada: item.cantidad
        });
      }
    }
    
    // Actualizar stock de los productos
    for (const item of items) {
      const updateResult = await ProductosService.updateStock(item.producto_id, item.cantidad);
      if (!updateResult) {
        console.error(`Error al actualizar stock del producto ${item.producto_id}`);
      }
    }
    
    // Cambiar estado a procesado
    await Carrito.updateStatus(carritoId, 'procesado');
    
    // Crear un nuevo carrito activo
    const nuevoCarritoId = await Carrito.create(usuarioId);
    
    res.status(200).json({ 
      message: 'Carrito procesado exitosamente',
      carritoId: carritoId,
      nuevoCarritoId: nuevoCarritoId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al procesar el carrito' });
  }
};