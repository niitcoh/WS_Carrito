const pool = require('../config/database');

class ItemCarrito {
  // Agregar un item al carrito
  static async add(carritoId, productoId, cantidad, precioUnitario) {
    // Verificar si el producto ya existe en el carrito
    const [existente] = await pool.query(
      `SELECT * FROM items_carrito 
      WHERE carrito_id = ? AND producto_id = ?`,
      [carritoId, productoId]
    );
    
    // Calcular subtotal
    const subtotal = cantidad * precioUnitario;
    
    if (existente.length > 0) {
      // Actualizar cantidad y subtotal del item existente
      const nuevaCantidad = existente[0].cantidad + cantidad;
      const nuevoSubtotal = nuevaCantidad * precioUnitario;
      
      const [result] = await pool.query(
        `UPDATE items_carrito 
        SET cantidad = ?, subtotal = ? 
        WHERE carrito_id = ? AND producto_id = ?`,
        [nuevaCantidad, nuevoSubtotal, carritoId, productoId]
      );
      
      return existente[0].id;
    } else {
      // Crear nuevo item
      const [result] = await pool.query(
        `INSERT INTO items_carrito 
        (carrito_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (?, ?, ?, ?, ?)`,
        [carritoId, productoId, cantidad, precioUnitario, subtotal]
      );
      
      return result.insertId;
    }
  }
  
  // Actualizar cantidad de un item
  static async updateQuantity(id, cantidad, precioUnitario) {
    const subtotal = cantidad * precioUnitario;
    
    const [result] = await pool.query(
      `UPDATE items_carrito 
      SET cantidad = ?, subtotal = ? 
      WHERE id = ?`,
      [cantidad, subtotal, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Eliminar un item del carrito
  static async remove(id) {
    const [result] = await pool.query(
      `DELETE FROM items_carrito WHERE id = ?`,
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Obtener todos los items de un carrito
  static async getAllByCartId(carritoId) {
    const [rows] = await pool.query(
      `SELECT * FROM items_carrito WHERE carrito_id = ?`,
      [carritoId]
    );
    
    return rows;
  }
  
  // Obtener un item por ID
  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM items_carrito WHERE id = ?`,
      [id]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  // Eliminar todos los items de un carrito
  static async removeAllFromCart(carritoId) {
    const [result] = await pool.query(
      `DELETE FROM items_carrito WHERE carrito_id = ?`,
      [carritoId]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = ItemCarrito;