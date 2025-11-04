/**
 * Sistema de logging seguro que solo muestra logs en desarrollo
 * y nunca expone información sensible en producción
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Función para sanitizar datos sensibles
const sanitizeData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveKeys = [
    'password', 'contraseña', 'token', 'secret', 'documento', 
    'cedula', 'email', 'telefono', 'usuario', 'id', 'hash',
    'salt', 'key', 'api', 'access', 'private'
  ];
  
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
      if (isDevelopment) {
        sanitized[key] = '[REDACTED_DEV]';
      } else {
        delete sanitized[key]; // En producción, eliminar completamente
      }
    }
  });
  
  return sanitized;
};

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
    // En producción: silencio total
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // En producción, solo log errores críticos sin datos sensibles
      // Solo para debugging interno, no visible en consola de usuario
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
    // En producción: silencio total
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
    // En producción: silencio total
  },
  
  // Para datos que pueden contener información sensible
  logSafe: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(message, data ? sanitizeData(data) : '');
    }
    // En producción: silencio total
  },
  
  errorSafe: (message: string, error?: any) => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // En producción: silencio total, ni siquiera el mensaje
  }
};

export default logger;