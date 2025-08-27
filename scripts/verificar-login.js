#!/usr/bin/env node

/**
 * Script de diagnóstico para verificar configuración de login
 * Sirius Regenerative Solutions S.A.S
 */

require('dotenv').config({ path: '.env.local' });

const fetch = require('node-fetch');

const requiredEnvVars = [
  'AIRTABLE_API_KEY',
  'AIRTABLE_BASE_ID',
  'USUARIOS_TABLE_ID',
  'USUARIOS_RAIZ_TABLE_ID',
  'USUARIOS_USUARIO_FIELD_ID',
  'USUARIOS_HASH_FIELD_ID',
  'USUARIOS_SALT_FIELD_ID',
  'USUARIOS_NUMERO_DOCUMENTO_FIELD_ID',
  'USUARIOS_AREA_EMPRESA_FIELD_ID',
  'USUARIOS_ROL_USUARIO_FIELD_ID',
  'USUARIOS_RAIZ_USUARIO_FIELD_ID',
  'USUARIOS_RAIZ_HASH_FIELD_ID',
  'USUARIOS_RAIZ_SALT_FIELD_ID',
  'USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID',
  'USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID'
];

console.log('🔍 Verificando configuración de login...\n');

let hasErrors = false;

// Verificar variables de entorno
console.log('📋 Variables de entorno requeridas:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NO DEFINIDA`);
    hasErrors = true;
  } else {
    console.log(`✅ ${varName}: CONFIGURADA (${value.length} caracteres)`);
  }
});

if (hasErrors) {
  console.log('\n❌ CONFIGURACIÓN INCOMPLETA');
  console.log('   Faltan variables de entorno requeridas.');
  console.log('   Revisa tu archivo .env.local');
  process.exit(1);
}

console.log('\n✅ CONFIGURACIÓN COMPLETA');
console.log('   Todas las variables de entorno están configuradas.');

// Verificar conectividad con Airtable (opcional)
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID) {
  console.log('\n🌐 Verificando conectividad con Airtable...');

  try {
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      console.log('✅ Conectividad con Airtable: OK');
    } else {
      console.log(`⚠️  Conectividad con Airtable: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('⚠️  Error conectando con Airtable:', error.message);
  }
}

console.log('\n🚀 Configuración lista para producción!');
console.log('   Ejecuta: npm run build && npm run start');
