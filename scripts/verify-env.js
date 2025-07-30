#!/usr/bin/env node

/**
 * Script para verificar la configuración de variables de entorno
 * Sirius Regenerative Solutions S.A.S ZOMAC
 */

require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID', 
  'USUARIOS_TABLE_ID',
  'USUARIO_FIELD_ID',
  'HASH_FIELD_ID',
  'SALT_FIELD_ID',
  'NOMBRE_RAZON_SOCIAL_FIELD_ID',
  'DOCUMENTO_FIELD_ID'
];

const optionalEnvVars = [
  'JWT_SECRET',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID'
];

console.log('🔍 Verificando configuración de variables de entorno...\n');

let hasErrors = false;
let hasWarnings = false;

// Verificar variables requeridas
console.log('📋 Variables Requeridas:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NO DEFINIDA`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('XXXXX')) {
    console.log(`⚠️  ${varName}: VALOR POR DEFECTO (necesita configuración)`);
    hasWarnings = true;
  } else {
    console.log(`✅ ${varName}: CONFIGURADA`);
  }
});

console.log('\n📋 Variables Opcionales:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`⚠️  ${varName}: NO DEFINIDA (opcional)`);
  } else if (value.includes('your_') || value.includes('XXXXX')) {
    console.log(`⚠️  ${varName}: VALOR POR DEFECTO (necesita configuración)`);
  } else {
    console.log(`✅ ${varName}: CONFIGURADA`);
  }
});

console.log('\n' + '='.repeat(60));

// Verificar modo desarrollo local
const isDevelopment = process.env.NODE_ENV !== 'production'; // En npm run dev, NODE_ENV suele ser undefined
const useLocalAuth = isDevelopment && (!process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_API_KEY.includes('your_'));

if (useLocalAuth) {
  console.log('🧪 MODO DESARROLLO LOCAL ACTIVADO');
  console.log('   El sistema usará usuarios de prueba predefinidos.');
  console.log('   Consulta USUARIOS_PRUEBA.md para credenciales.');
} else if (hasErrors) {
  console.log('❌ CONFIGURACIÓN INCOMPLETA');
  console.log('   Faltan variables de entorno requeridas.');
  console.log('   El sistema NO funcionará correctamente.');
  console.log('\n📖 Para configurar:');
  console.log('   1. Copia .env.local y edita con tus credenciales');
  console.log('   2. Consulta ENVIRONMENT_SETUP.md para más detalles');
  process.exit(1);
} else if (hasWarnings) {
  console.log('⚠️  CONFIGURACIÓN PARCIAL');
  console.log('   Algunas variables tienen valores por defecto.');
  console.log('   Actualiza .env.local con tus credenciales reales.');
} else {
  console.log('✅ CONFIGURACIÓN COMPLETA');
  console.log('   Todas las variables están configuradas correctamente.');
}

console.log('\n🚀 Para iniciar el servidor: npm run dev');
console.log('📖 Documentación: ENVIRONMENT_SETUP.md');
if (useLocalAuth) {
  console.log('👤 Usuarios de prueba: USUARIOS_PRUEBA.md');
}
