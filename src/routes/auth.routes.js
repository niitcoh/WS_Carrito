const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Endpoint para generar token de prueba
router.post('/test-token', (req, res) => {
  try {
    const payload = {
      id: 1,
      email: 'test@example.com',
      rol_id: 1
    };
    
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
    
    res.status(200).json({ 
      message: 'Token de prueba generado exitosamente',
      token
    });
  } catch (error) {
    console.error('Error al generar token:', error);
    res.status(500).json({ message: 'Error al generar token' });
  }
});

module.exports = router;