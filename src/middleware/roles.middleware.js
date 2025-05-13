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