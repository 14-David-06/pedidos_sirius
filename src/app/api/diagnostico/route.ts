import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;

// Field IDs para Usuarios regulares
const USUARIOS_USUARIO_FIELD_ID = process.env.USUARIOS_USUARIO_FIELD_ID;
const USUARIOS_HASH_FIELD_ID = process.env.USUARIOS_HASH_FIELD_ID;
const USUARIOS_SALT_FIELD_ID = process.env.USUARIOS_SALT_FIELD_ID;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID;
const USUARIOS_ROL_USUARIO_FIELD_ID = process.env.USUARIOS_ROL_USUARIO_FIELD_ID;

// Field IDs para Usuarios Raíz
const USUARIOS_RAIZ_USUARIO_FIELD_ID = process.env.USUARIOS_RAIZ_USUARIO_FIELD_ID;
const USUARIOS_RAIZ_HASH_FIELD_ID = process.env.USUARIOS_RAIZ_HASH_FIELD_ID;
const USUARIOS_RAIZ_SALT_FIELD_ID = process.env.USUARIOS_RAIZ_SALT_FIELD_ID;
const USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID = process.env.USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID;
const USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID;

export async function GET(request: NextRequest) {
  const requestId = Date.now().toString();
  console.log(`🔍 [${requestId}] ===== INICIANDO DIAGNÓSTICO DE CONFIGURACIÓN =====`);

  try {
    // Variables requeridas para login
    const requiredEnvVars = {
      AIRTABLE_API_KEY: !!AIRTABLE_API_KEY,
      AIRTABLE_BASE_ID: !!AIRTABLE_BASE_ID,
      USUARIOS_TABLE_ID: !!USUARIOS_TABLE_ID,
      USUARIOS_RAIZ_TABLE_ID: !!USUARIOS_RAIZ_TABLE_ID,
      USUARIOS_USUARIO_FIELD_ID: !!USUARIOS_USUARIO_FIELD_ID,
      USUARIOS_HASH_FIELD_ID: !!USUARIOS_HASH_FIELD_ID,
      USUARIOS_SALT_FIELD_ID: !!USUARIOS_SALT_FIELD_ID,
      USUARIOS_NUMERO_DOCUMENTO_FIELD_ID: !!USUARIOS_NUMERO_DOCUMENTO_FIELD_ID,
      USUARIOS_AREA_EMPRESA_FIELD_ID: !!USUARIOS_AREA_EMPRESA_FIELD_ID,
      USUARIOS_ROL_USUARIO_FIELD_ID: !!USUARIOS_ROL_USUARIO_FIELD_ID,
      USUARIOS_RAIZ_USUARIO_FIELD_ID: !!USUARIOS_RAIZ_USUARIO_FIELD_ID,
      USUARIOS_RAIZ_HASH_FIELD_ID: !!USUARIOS_RAIZ_HASH_FIELD_ID,
      USUARIOS_RAIZ_SALT_FIELD_ID: !!USUARIOS_RAIZ_SALT_FIELD_ID,
      USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID: !!USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID,
      USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID: !!USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'NOT SET',
        VERCEL_ENV: process.env.VERCEL_ENV || 'NOT SET',
        VERCEL_URL: process.env.VERCEL_URL || 'NOT SET'
      },
      configuration: {
        totalRequiredVars: Object.keys(requiredEnvVars).length,
        missingVarsCount: missingVars.length,
        configuredVarsCount: Object.keys(requiredEnvVars).length - missingVars.length,
        isFullyConfigured: missingVars.length === 0
      },
      missingVars: missingVars,
      currentValues: {
        AIRTABLE_API_KEY: AIRTABLE_API_KEY ? `SET (${AIRTABLE_API_KEY.length} chars)` : 'NOT SET',
        AIRTABLE_BASE_ID: AIRTABLE_BASE_ID || 'NOT SET',
        USUARIOS_TABLE_ID: USUARIOS_TABLE_ID || 'NOT SET',
        USUARIOS_RAIZ_TABLE_ID: USUARIOS_RAIZ_TABLE_ID || 'NOT SET',
        USUARIOS_USUARIO_FIELD_ID: USUARIOS_USUARIO_FIELD_ID || 'NOT SET',
        USUARIOS_RAIZ_USUARIO_FIELD_ID: USUARIOS_RAIZ_USUARIO_FIELD_ID || 'NOT SET'
      },
      allUserRelatedVars: Object.keys(process.env)
        .filter(key => key.includes('USUARIO') || key.includes('AIRTABLE'))
        .sort()
        .map(key => ({
          variable: key,
          isSet: !!process.env[key],
          length: process.env[key]?.length || 0
        }))
    };

    console.log(`🔍 [${requestId}] Diagnóstico completado:`, {
      isFullyConfigured: diagnostic.configuration.isFullyConfigured,
      missingVarsCount: diagnostic.configuration.missingVarsCount,
      missingVars: diagnostic.missingVars
    });

    if (missingVars.length > 0) {
      console.error(`❌ [${requestId}] Variables faltantes:`, missingVars);
      return NextResponse.json(diagnostic, { status: 500 });
    }

    console.log(`✅ [${requestId}] Configuración completa - todas las variables están presentes`);
    return NextResponse.json(diagnostic, { status: 200 });

  } catch (error) {
    console.error(`💥 [${requestId}] Error en diagnóstico:`, error);
    return NextResponse.json({
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
