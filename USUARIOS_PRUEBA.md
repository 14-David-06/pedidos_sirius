# 🧪 Usuarios de Prueba - Modo Desarrollo Local

## Información Importante

Cuando el sistema detecta que las variables de entorno tienen valores por defecto (contienen "your_"), automáticamente activa el **modo desarrollo local** con usuarios de prueba predefinidos.

## 👤 Usuarios Disponibles

### 1. Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Nombre**: Administrador Sistema
- **Documento**: 12345678
- **Rol**: Administrador del sistema

### 2. Desarrollador
- **Usuario**: `david`
- **Contraseña**: `david123`
- **Nombre**: David Desarrollador
- **Documento**: 87654321
- **Rol**: Desarrollador/Técnico

### 3. Empresa
- **Usuario**: `sirius`
- **Contraseña**: `sirius2025`
- **Nombre**: Sirius Regenerative Solutions
- **Documento**: 900123456
- **Rol**: Cuenta empresarial

## 🔄 Activación del Modo Local

El modo desarrollo local se activa automáticamente cuando:

1. `NODE_ENV=development` (modo desarrollo de Next.js)
2. Y cualquiera de estas condiciones:
   - `AIRTABLE_API_KEY` no está definida
   - `AIRTABLE_API_KEY` contiene "your_" (valor por defecto)

## ✅ Cómo Usar

1. **Iniciar el servidor**:
   ```bash
   npm run dev
   ```

2. **Ir a la página de login**:
   http://localhost:3000/login

3. **Usar cualquiera de los usuarios de prueba** listados arriba

4. **Verificar en la consola** que aparezca:
   ```
   🧪 Modo desarrollo local activado
   ✅ Login exitoso (modo desarrollo)
   ```

## 🚀 Migrar a Producción

Para usar la base de datos real de Airtable:

1. **Configurar las variables** en `.env.local` con valores reales
2. **Reiniciar el servidor** (`npm run dev`)
3. **Verificar** que el modo local se desactive

## 🔍 Debugging

Si hay problemas con el login:

1. **Verificar la consola del navegador** (F12)
2. **Revisar la consola del servidor** donde ejecutaste `npm run dev`
3. **Ejecutar verificación**: `npm run verify-env`

## ⚠️ Importante

- Estos usuarios **SOLO** funcionan en modo desarrollo
- **NO** están disponibles en producción
- Las contraseñas son simples por propósitos de testing
- En producción usar contraseñas seguras y Airtable real
