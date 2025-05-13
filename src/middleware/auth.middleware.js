const authConfig = require('../config/auth');
require('dotenv').config();

exports.verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = authConfig.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    
    // Agregar información del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol_id: decoded.rol_id
    };
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la autenticación' });
  }
};

exports.esAdmin = (req, res, next) => {
  if (req.user.rol_id !== 1) { // 1 = admin
    return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de administrador' });
  }
  
  next();
};

exports.tieneRol = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol_id)) {
      return res.status(403).json({ message: 'Acceso denegado: No tienes los permisos necesarios' });
    }
    
    next();
  };
};