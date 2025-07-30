# 🔧 Configuración del Entorno - Sirius Regenerative Solutions

## Variables de Entorno Requeridas

Para que el sistema funcione correctamente, necesitas configurar las siguientes variables de entorno en el archivo `.env.local`:

### 🗃️ Configuración de Airtable

El sistema utiliza Airtable como base de datos. Sigue estos pasos para configurarlo:

1. **Crear cuenta en Airtable**: https://airtable.com
2. **Crear una nueva base** con las siguientes tablas:
   - `Usuarios` - Para almacenar usuarios del sistema
   - `Pedidos` - Para gestionar los pedidos de laboratorio

3. **Obtener API Key**:
   - Ve a https://airtable.com/create/tokens
   - Crea un nuevo token con permisos de lectura y escritura
   - Copia el token generado

4. **Obtener Base ID**:
   - Abre tu base en Airtable
   - La URL tendrá el formato: `https://airtable.com/appXXXXXXXXXXXXXX/...`
   - El `appXXXXXXXXXXXXXX` es tu Base ID

5. **Obtener Table ID**:
   - Ve a la documentación de la API: https://airtable.com/api
   - Selecciona tu base
   - Los Table IDs aparecen en la documentación

6. **Obtener Field IDs**:
   - En la misma documentación de la API
   - Los Field IDs tienen el formato `fldXXXXXXXXXXXXXX`

### 📋 Estructura de la Tabla de Usuarios

La tabla `Usuarios` debe tener los siguientes campos:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| Usuario | Single line text | Nombre de usuario único |
| Hash | Single line text | Hash de la contraseña (generado automáticamente) |
| Salt | Single line text | Salt para el hash (generado automáticamente) |
| Nombre/Razón Social | Single line text | Nombre completo o razón social |
| Documento | Single line text | Número de documento de identidad |

### 🔐 Configuración de Seguridad

- **JWT_SECRET**: Una cadena aleatoria de al menos 32 caracteres para firmar tokens
- Genera una clave segura con: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 📱 Configuración de Telegram (Opcional)

Para recibir notificaciones:

1. **Crear un bot**:
   - Habla con @BotFather en Telegram
   - Usa `/newbot` y sigue las instrucciones
   - Guarda el token del bot

2. **Obtener Chat ID**:
   - Envía un mensaje a tu bot
   - Ve a: `https://api.telegram.org/bot<YourBOTToken>/getUpdates`
   - Busca el `chat.id` en la respuesta

## 🚀 Pasos para Configurar

1. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Edita `.env.local`** con tus credenciales reales

3. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## ⚠️ Importante

- **NUNCA** subas el archivo `.env.local` a git
- El archivo `.env.local` está incluido en `.gitignore`
- Las credenciales son sensibles y deben mantenerse privadas

## 🧪 Verificación de Configuración

El sistema incluye un script para verificar que todas las variables estén configuradas:

```bash
node scripts/verify-env.js
```

## 🆘 Solución de Problemas

### Error: "Error de configuración del servidor"
- Verifica que todas las variables de entorno estén definidas
- Ejecuta el script de verificación
- Revisa que las credenciales de Airtable sean correctas

### Error: "Usuario no encontrado"
- Verifica que la tabla de usuarios exista en Airtable
- Confirma que los Field IDs sean correctos
- Asegúrate de que haya al menos un usuario registrado

### Error de conexión a Airtable
- Verifica tu conexión a internet
- Confirma que la API Key tenga los permisos necesarios
- Revisa que el Base ID sea correcto

---

Para más ayuda, consulta la documentación oficial de:
- [Airtable API](https://airtable.com/api)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
