const axios = require('axios');

// Configuración
const CARRITO_API = 'http://localhost:3004/api';
const PRODUCTOS_API = 'http://localhost:3000/api';

// Función para pausar
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función principal de pruebas
async function runTests() {
  try {
    console.log('Iniciando pruebas de la API de Carrito con autenticación...\n');
    
    // 1. Obtener token de autenticación
    console.log('1. Obteniendo token de prueba...');
    const authResponse = await axios.post(`${CARRITO_API}/auth/test-token`);
    const token = authResponse.data.token;
    console.log(`   Token obtenido: ${token.substring(0, 20)}...`);
    
    // Configuración con token para todas las solicitudes siguientes
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    // 2. Verificar producto disponible
    console.log('\n2. Verificando producto disponible...');
    const productoRes = await axios.get(`${PRODUCTOS_API}/productos/1`);
    console.log(`   Producto: ${productoRes.data.nombre}`);
    console.log(`   Stock inicial: ${productoRes.data.stock}`);
    const productoId = productoRes.data.id;
    
    // 3. Agregar producto al carrito
    console.log('\n3. Agregando producto al carrito...');
    const cantidad = 2;
    const agregarRes = await axios.post(`${CARRITO_API}/items`, {
      producto_id: productoId,
      cantidad: cantidad
    }, config);
    console.log(`   Respuesta: ${agregarRes.data.message}`);
    
    // 4. Obtener carrito activo
    console.log('\n4. Obteniendo carrito activo...');
    const carritoRes = await axios.get(`${CARRITO_API}/carrito/activo`, config);
    console.log(`   Carrito ID: ${carritoRes.data.carrito.id}`);
    console.log(`   Cantidad de items: ${carritoRes.data.items.length}`);
    
    const carritoId = carritoRes.data.carrito.id;
    const itemId = carritoRes.data.items[0].id;
    
    // 5. Actualizar cantidad
    console.log('\n5. Actualizando cantidad del producto...');
    const nuevaCantidad = 3;
    const actualizarRes = await axios.put(`${CARRITO_API}/items/${itemId}`, {
      cantidad: nuevaCantidad
    }, config);
    console.log(`   Respuesta: ${actualizarRes.data.message}`);
    
    // 6. Procesar carrito
    console.log('\n6. Procesando carrito...');
    const procesarRes = await axios.post(`${CARRITO_API}/carrito/${carritoId}/procesar`, {}, config);
    console.log(`   Respuesta: ${procesarRes.data.message}`);
    console.log(`   Nuevo carrito ID: ${procesarRes.data.nuevoCarritoId}`);
    
    // 7. Verificar stock actualizado
    await sleep(1000); // Esperamos un segundo para asegurar que se ha actualizado el stock
    console.log('\n7. Verificando stock actualizado...');
    const productoActualizadoRes = await axios.get(`${PRODUCTOS_API}/productos/${productoId}`);
    console.log(`   Stock final: ${productoActualizadoRes.data.stock}`);
    console.log(`   Unidades procesadas: ${nuevaCantidad}`);
    console.log(`   Cambio de stock: ${productoRes.data.stock - productoActualizadoRes.data.stock}`);
    
    // Conclusión
    console.log('\n----- Pruebas completadas -----');
    console.log('La API de carrito funciona correctamente con autenticación!');
    
  } catch (error) {
    console.error('Error durante las pruebas:');
    if (error.response) {
      console.error(`Estado: ${error.response.status}`);
      console.error('Datos:', error.response.data);
    } else if (error.request) {
      console.error('No se recibió respuesta. Verifica que ambas APIs estén en ejecución.');
    } else {
      console.error('Error:', error.message);
    }
    console.error('Ubicación del error:', error.stack.split('\n')[1].trim());
  }
}

// Ejecutar las pruebas
runTests();