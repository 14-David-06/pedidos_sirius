// Sistema de logging seguro - evita exposición de información sensible en producción

interface LogLevel {
  DEBUG: number;
  INFO: number;
  WARN: number;
  ERROR: number;
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const isProduction = process.env.NODE_ENV === 'production';
const currentLogLevel = isProduction ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

class SecureLogger {
  private sanitizeData(data: any): any {
    if (typeof data === 'string') {
      // Eliminar posibles credenciales o información sensible
      return data.replace(/pat[a-zA-Z0-9]{16,}/g, '[AIRTABLE_TOKEN]')
                 .replace(/app[a-zA-Z0-9]{16,}/g, '[AIRTABLE_BASE]')
                 .replace(/tbl[a-zA-Z0-9]{14,}/g, '[AIRTABLE_TABLE]');
    }
    
    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        // No incluir campos que contengan información sensible
        if (['password', 'token', 'key', 'secret', 'api_key', 'cedula'].some(sensitive => 
          key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitizeData(value);
        }
      }
      return sanitized;
    }
    
    return data;
  }

  debug(message: string, data?: any): void {
    if (currentLogLevel <= LOG_LEVELS.DEBUG) {
      console.log(`[DEBUG] ${message}`, data ? this.sanitizeData(data) : '');
    }
  }

  info(message: string, data?: any): void {
    if (currentLogLevel <= LOG_LEVELS.INFO) {
      console.log(`[INFO] ${message}`, data ? this.sanitizeData(data) : '');
    }
  }

  warn(message: string, data?: any): void {
    if (currentLogLevel <= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, data ? this.sanitizeData(data) : '');
    }
  }

  error(message: string, error?: any): void {
    if (currentLogLevel <= LOG_LEVELS.ERROR) {
      // En producción, solo registrar errores sin detalles sensibles
      if (isProduction) {
        console.error(`[ERROR] ${message}`);
      } else {
        console.error(`[ERROR] ${message}`, error);
      }
    }
  }

  // Método especial para operaciones exitosas en desarrollo
  success(message: string, data?: any): void {
    if (!isProduction) {
      console.log(`[SUCCESS] ${message}`, data ? this.sanitizeData(data) : '');
    }
  }
}

export const logger = new SecureLogger();

// Función para verificar si se debe mostrar información de debug
export const isDebugMode = (): boolean => {
  return !isProduction && process.env.DEBUG_MODE !== 'false';
};
