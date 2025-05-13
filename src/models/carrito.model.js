const pool = require('../config/database');

class Carrito {
  // Obtener el carrito activo del usuario
  static async getActiveByUserId(usuarioId) {
    const [rows] = await pool.query(
      `SELECT * FROM carritos 
      WHERE usuario_id = ? AND estado = 'activo'
      ORDER BY created_at DESC LIMIT 1`,
      [usuarioId]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  // Crear un nuevo carrito
  static async create(usuarioId) {
    const [result] = await pool.query(
      `INSERT INTO carritos (usuario_id, estado)
      VALUES (?, 'activo')`,
      [usuarioId]
    );
    
    return result.insertId;
  }
  
  // Actualizar el total del carrito
  static async updateTotal(id, total) {
    const [result] = await pool.query(
      `UPDATE carritos SET total = ? WHERE id = ?`,
      [total, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Cambiar el estado del carrito
  static async updateStatus(id, estado) {
    const [result] = await pool.query(
      `UPDATE carritos SET estado = ? WHERE id = ?`,
      [estado, id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Obtener todos los carritos de un usuario
  static async getAllByUserId(usuarioId) {
    const [rows] = await pool.query(
      `SELECT * FROM carritos WHERE usuario_id = ? ORDER BY created_at DESC`,
      [usuarioId]
    );
    
    return rows;
  }
  
  // Obtener un carrito por ID
  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT * FROM carritos WHERE id = ?`,
      [id]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  // Eliminar un carrito
  static async delete(id) {
    const [result] = await pool.query(
      `DELETE FROM carritos WHERE id = ?`,
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  // Calcular total de un carrito
  static async calculateTotal(carritoId) {
    const [rows] = await pool.query(
      `SELECT SUM(subtotal) as total FROM items_carrito 
      WHERE carrito_id = ?`,
      [carritoId]
    );
    
    return rows[0].total || 0;
  }
}

module.exports = Carrito;