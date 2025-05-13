const axios = require('axios');
require('dotenv').config();

// URL base de la API de productos
const API_URL = process.env.API_PRODUCTOS_URL;

class ProductosService {
  // Verificar si un producto existe y obtener su precio
  static async getProductDetails(productoId) {
    try {
      const response = await axios.get(`${API_URL}/productos/${productoId}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener detalles del producto:', error.message);
      return null;
    }
  }
  
  // Verificar stock disponible
  static async checkStock(productoId, cantidad) {
    try {
      // Usar el nuevo endpoint dedicado
      const response = await axios.post(`${API_URL}/productos/check-stock`, {
        producto_id: productoId,
        cantidad
      });
      return response.data;
    } catch (error) {
      console.error('Error al verificar stock:', error.message);
      
      // Alternativa: usar método antiguo si el endpoint falla
      try {
        const producto = await this.getProductDetails(productoId);
        if (!producto) {
          return {
            disponible: false,
            mensaje: 'Producto no encontrado',
            stock: 0
          };
        }
        
        return {
          disponible: producto.stock >= cantidad,
          stock: producto.stock,
          precio: producto.precio
        };
      } catch (innerError) {
        console.error('Error secundario al verificar stock:', innerError.message);
        return {
          disponible: false,
          mensaje: 'Error al verificar disponibilidad',
          stock: 0
        };
      }
    }
  }
  
  // Actualizar stock (reducir)
  static async updateStock(productoId, cantidad) {
    try {
      await axios.post(`${API_URL}/productos/update-stock`, {
        producto_id: productoId,
        cantidad
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar stock:', error.message);
      return false;
    }
  }
  
  // Restaurar stock (aumentar)
  static async restoreStock(productoId, cantidad) {
    try {
      await axios.post(`${API_URL}/productos/restore-stock`, {
        producto_id: productoId,
        cantidad
      });
      return true;
    } catch (error) {
      console.error('Error al restaurar stock:', error.message);
      return false;
    }
  }
}

module.exports = ProductosService;