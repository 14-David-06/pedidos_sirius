import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;
const USUARIOS_RAIZ_USUARIO_FIELD_ID = process.env.USUARIOS_RAIZ_USUARIO_FIELD_ID;
const USUARIOS_RAIZ_HASH_FIELD_ID = process.env.USUARIOS_RAIZ_HASH_FIELD_ID;
const USUARIOS_RAIZ_SALT_FIELD_ID = process.env.USUARIOS_RAIZ_SALT_FIELD_ID;

export async function POST(request: NextRequest) {
  console.log('🔍 [TEST_LOGIN] Probando consulta a Airtable...');
  
  try {
    const usuario = 'guaicaramo';
    
    console.log('🔧 [TEST_LOGIN] Variables de entorno:', {
      AIRTABLE_API_KEY: AIRTABLE_API_KEY ? `${AIRTABLE_API_KEY.substring(0, 10)}...` : 'undefined',
      AIRTABLE_BASE_ID,
      USUARIOS_RAIZ_TABLE_ID,
      USUARIOS_RAIZ_USUARIO_FIELD_ID,
      USUARIOS_RAIZ_HASH_FIELD_ID,
      USUARIOS_RAIZ_SALT_FIELD_ID
    });

    // Construir la URL exacta que usa el login
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}`;
    const searchParams = new URLSearchParams({
      filterByFormula: `{${USUARIOS_RAIZ_USUARIO_FIELD_ID}} = "${usuario}"`
    });
    
    const fullUrl = `${airtableUrl}?${searchParams}`;
    
    console.log('🌐 [TEST_LOGIN] URL de consulta:', fullUrl);
    console.log('🔑 [TEST_LOGIN] Headers:', {
      'Authorization': `Bearer ${AIRTABLE_API_KEY?.substring(0, 10)}...`,
      'Content-Type': 'application/json'
    });

    // Hacer la consulta a Airtable
    const response = await fetch(fullUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📥 [TEST_LOGIN] Respuesta de Airtable:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [TEST_LOGIN] Error de Airtable:', errorText);
      return NextResponse.json({ 
        error: 'Error en consulta a Airtable',
        details: errorText,
        status: response.status
      }, { status: 500 });
    }

    const data = await response.json();
    console.log('📋 [TEST_LOGIN] Datos recibidos:', {
      recordsCount: data.records?.length || 0,
      hasRecords: !!(data.records && data.records.length > 0)
    });

    if (data.records && data.records.length > 0) {
      const record = data.records[0];
      const fields = record.fields;
      
      console.log('👤 [TEST_LOGIN] Primer registro encontrado:', {
        id: record.id,
        allFieldKeys: Object.keys(fields),
        hashValue: fields[USUARIOS_RAIZ_HASH_FIELD_ID!],
        saltValue: fields[USUARIOS_RAIZ_SALT_FIELD_ID!],
        usuarioValue: fields[USUARIOS_RAIZ_USUARIO_FIELD_ID!],
        hasHash: !!fields[USUARIOS_RAIZ_HASH_FIELD_ID!],
        hasSalt: !!fields[USUARIOS_RAIZ_SALT_FIELD_ID!]
      });
      
      return NextResponse.json({
        success: true,
        message: 'Consulta exitosa',
        recordId: record.id,
        usuario: fields[USUARIOS_RAIZ_USUARIO_FIELD_ID!],
        hasHash: !!fields[USUARIOS_RAIZ_HASH_FIELD_ID!],
        hasSalt: !!fields[USUARIOS_RAIZ_SALT_FIELD_ID!],
        hashLength: fields[USUARIOS_RAIZ_HASH_FIELD_ID!]?.length || 0,
        saltLength: fields[USUARIOS_RAIZ_SALT_FIELD_ID!]?.length || 0,
        allFields: Object.keys(fields),
        fieldIds: {
          hash: USUARIOS_RAIZ_HASH_FIELD_ID,
          salt: USUARIOS_RAIZ_SALT_FIELD_ID,
          usuario: USUARIOS_RAIZ_USUARIO_FIELD_ID
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Usuario no encontrado',
        recordsCount: data.records?.length || 0,
        fullResponse: data
      });
    }

  } catch (error) {
    console.error('💥 [TEST_LOGIN] Error:', error);
    return NextResponse.json({ 
      error: 'Error interno',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
