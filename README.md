# 🧪 Sirius Lab - Sistema de Gestión de Pedidos

Sistema de gestión de solicitudes de pedidos de insumos, materiales y reactivos para el laboratorio de Sirius Regenerative Solutions S.A.S ZOMAC.

## 🚀 Características

- **Autenticación completa** con registro y login
- **Dashboard interactivo** con estadísticas y filtros
- **Formulario dinámico** para crear solicitudes
- **Gestión de roles** (Admin/Usuario)
- **Integración con Airtable** como base de datos
- **Diseño responsive** y profesional
- **Gestión de perfil** de usuario

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Base de datos**: Airtable
- **Autenticación**: JWT + bcryptjs
- **Validaciones**: Zod + React Hook Form
- **Icons**: Lucide React

## 📋 Prerrequisitos

- Node.js 18+ 
- NPM o Yarn
- Cuenta de Airtable

## 🔧 Configuración Inicial

### 1. Clonar e instalar dependencias

```bash
git clone <repository-url>
cd pedidos_laboratorio
npm install
```

### 2. Configurar Airtable

1. Crear una nueva base en [Airtable](https://airtable.com)
2. Crear las siguientes tablas con estos campos:

#### Tabla: Users
- **email** (Single line text)
- **name** (Single line text) 
- **password** (Single line text)
- **role** (Single select: admin, user)
- **createdAt** (Date)
- **updatedAt** (Date)

#### Tabla: Products
- **name** (Single line text)
- **type** (Single select: hongo, bacteria)
- **category** (Single line text)
- **description** (Long text)

#### Tabla: Orders
- **userId** (Single line text)
- **userName** (Single line text)
- **userEmail** (Email)
- **reason** (Single line text)
- **estimatedDate** (Date)
- **priority** (Single select: alta, media, baja)
- **status** (Single select: pendiente, aprobado, rechazado, en_proceso, completado)
- **observations** (Long text)
- **totalItems** (Number)
- **createdAt** (Date)
- **updatedAt** (Date)
- **approvedBy** (Single line text)
- **approvedAt** (Date)

#### Tabla: OrderItems
- **orderId** (Single line text)
- **productId** (Single line text)
- **productName** (Single line text)
- **quantity** (Number)

### 3. Configurar variables de entorno

Copiar el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Completar las variables en `.env.local`:

```env
# Airtable Configuration
AIRTABLE_API_KEY=tu_api_key_de_airtable
AIRTABLE_BASE_ID=tu_base_id_de_airtable

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_secreto_muy_seguro_aqui

# JWT Secret
JWT_SECRET=tu_jwt_secret_muy_seguro
```

#### Obtener credenciales de Airtable:
1. Ir a [Airtable API](https://airtable.com/api)
2. Seleccionar tu base
3. Copiar el **Base ID** de la URL
4. Ir a [Account Settings](https://airtable.com/account) para obtener el **API Key**

### 4. Inicializar productos por defecto

```bash
npm run dev
```

Luego hacer un POST a: `http://localhost:3000/api/seed`

O usar curl:
```bash
curl -X POST http://localhost:3000/api/seed
```

## 🚀 Ejecutar la aplicación

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 👥 Uso de la Aplicación

### Para Usuarios Regulares:
1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Dashboard**: Ver todas las solicitudes propias
3. **Nueva Solicitud**: Crear solicitudes con productos dinámicos
4. **Perfil**: Actualizar información personal

### Para Administradores:
- Todas las funciones de usuario regular
- **Dashboard**: Ver todas las solicitudes de todos los usuarios
- **Gestión de Estados**: Aprobar, rechazar o cambiar estado de solicitudes

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   ├── orders/            # Gestión de pedidos
│   └── profile/           # Perfil de usuario
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI básicos
│   └── layout/           # Componentes de layout
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuraciones
├── services/             # Servicios para Airtable
└── types/                # Definiciones TypeScript
```

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Contraseñas hasheadas con bcrypt
- Validación de roles en todas las rutas protegidas
- Sanitización de datos de entrada

## 🎨 Personalización

### Colores de Marca
El sistema usa los colores institucionales de Sirius:
- **Azul primario**: `#2563eb` (blue-600)
- **Grises**: Tonos neutros para texto y fondos
- **Estados**: Verde (aprobado), Rojo (rechazado), Amarillo (pendiente)

### Componentes Personalizables
- Todos los componentes en `/components/ui` son reutilizables
- Estilos globales en `/app/globals.css`
- Configuración de Tailwind en `tailwind.config.js`

## 📝 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción
npm run lint         # Linter ESLint
npm run type-check   # Verificación de tipos TypeScript
```

## 🔧 Configuración Adicional

### ESLint y Prettier
El proyecto incluye configuración para:
- ESLint para análisis de código
- Prettier para formateo automático
- TypeScript strict mode

### Próximas Funcionalidades
- [ ] Subida de archivos adjuntos
- [ ] Notificaciones por email
- [ ] Exportar reportes
- [ ] Historial de cambios
- [ ] API REST completa
- [ ] Tests automatizados

## 🆘 Solución de Problemas

### Error de conexión Airtable
- Verificar API Key y Base ID
- Comprobar que las tablas existan con los campos correctos
- Verificar permisos de la API Key

### Error de autenticación
- Verificar JWT_SECRET en variables de entorno
- Limpiar localStorage del navegador
- Verificar que el usuario exista en Airtable

### Error de productos
- Ejecutar el endpoint de seed: `/api/seed`
- Verificar la tabla Products en Airtable

## 📞 Soporte

Sistema desarrollado para **Sirius Regenerative Solutions S.A.S ZOMAC**

Para soporte técnico o dudas sobre implementación, contactar al equipo de desarrollo.

---

© 2025 Sirius Lab - Gestión de Pedidos de Laboratorio
