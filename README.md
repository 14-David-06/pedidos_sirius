# Sirius Regenerative Laboratory - Sistema de Pedidos

Sistema completo de gestión de pedidos para el laboratorio de medicina regenerativa Sirius Lab, desarrollado con Next.js 14, TypeScript y Tailwind CSS.

## 🚀 Características

- **Autenticación completa**: Login y registro con validación en tiempo real
- **Diseño médico profesional**: Paleta de colores y UI adaptada al entorno sanitario
- **Responsive design**: Optimizado para desktop, tablet y móvil
- **TypeScript**: Tipado fuerte para mayor seguridad y mantenibilidad
- **Tailwind CSS**: Diseño moderno y consistente
- **Componentes reutilizables**: Arquitectura modular y escalable

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **UI Components**: Componentes custom optimizados
- **Iconos**: Lucide React
- **Linting**: ESLint + Prettier

## 📦 Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Ejecutar en modo desarrollo:
```bash
npm run dev
```

3. Abrir [http://localhost:3000](http://localhost:3000) en el navegador

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Estilos globales
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx          # Página de inicio
│   ├── login/            # Página de login
│   ├── register/         # Página de registro
│   └── dashboard/        # Dashboard (post-login)
├── components/
│   ├── ui/               # Componentes base reutilizables
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Checkbox.tsx
│   │   └── Loading.tsx
│   └── layout/           # Componentes de layout
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   └── utils.ts          # Utilidades y validaciones
└── types/
    └── index.ts          # Definiciones de tipos TypeScript
```

## 🎨 Diseño y UX

### Paleta de Colores
- **Primarios**: Azules médicos (#3b82f6 - #1e3a8a)
- **Secundarios**: Verdes regenerativos (#22c55e - #14532d)
- **Neutros**: Grises médicos (#f8fafc - #0f172a)

### Componentes Implementados
- ✅ Botones con variantes (primary, secondary, outline, ghost)
- ✅ Inputs con validación visual y iconos
- ✅ Cards con header, content y footer
- ✅ Checkboxes personalizados
- ✅ Loading spinners y estados de carga
- ✅ Layout responsive con header y footer

## 🔐 Autenticación

### Página de Login (`/login`)
- Validación de email y contraseña
- Opción "Recordarme"
- Enlace a recuperación de contraseña
- Estados de loading
- Validación en tiempo real

### Página de Registro (`/register`)
- Formulario completo con validaciones
- Validación de contraseña segura
- Confirmación de contraseña
- Aceptación de términos y condiciones
- Feedback visual de errores

## 📱 Responsive Design

- **Mobile First**: Diseño optimizado para móviles
- **Breakpoints**: sm, md, lg, xl
- **Grid System**: CSS Grid y Flexbox
- **Typography**: Escala tipográfica responsiva

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm start

# Linting
npm run lint
npm run lint:fix

# Formateo
npm run format
```

## 🚦 Validaciones Implementadas

### Email
- Formato válido de email
- Campo requerido

### Contraseña
- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

### Formularios
- Validación en tiempo real
- Limpieza de errores al escribir
- Estados de loading durante submit
- Feedback visual de errores

## 🎯 Próximas Funcionalidades

- [ ] Dashboard completo con gestión de pedidos
- [ ] Sistema de roles (admin, técnico, cliente)
- [ ] Gestión de pacientes y muestras
- [ ] Reportes y análisis
- [ ] Notificaciones en tiempo real
- [ ] API REST completa
- [ ] Base de datos
- [ ] Autenticación con JWT
- [ ] Recuperación de contraseña

## 👨‍💻 Desarrollo

El proyecto está configurado con:
- **Hot reload** para desarrollo rápido
- **TypeScript strict mode** para máxima seguridad de tipos
- **ESLint + Prettier** para código consistente
- **Tailwind CSS** con configuración personalizada

## 🏥 Contexto Médico

Este sistema está diseñado específicamente para laboratorios de medicina regenerativa, con:
- Terminología médica apropiada
- Flujos de trabajo adaptados al entorno sanitario
- Colores y diseño que inspiran confianza
- Componentes optimizados para eficiencia operativa

---

**Sirius Regenerative Laboratory** - Innovación en medicina regenerativa 🔬✨
