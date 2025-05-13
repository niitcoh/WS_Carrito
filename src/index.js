const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3004;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta básica
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Carrito funcionando correctamente',
    version: '1.0.0'
  });
});

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const carritoRoutes = require('./routes/carrito.routes');
const itemCarritoRoutes = require('./routes/itemCarrito.routes');

// Usar rutas
app.use('/api/auth', authRoutes); // Esta ruta NO requiere autenticación
app.use('/api/carrito', carritoRoutes);
app.use('/api/items', itemCarritoRoutes);

// Middleware para manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor de Carrito corriendo en http://localhost:${port}`);
});