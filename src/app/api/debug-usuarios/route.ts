import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
const USUARIOS_HASH_FIELD_ID = process.env.USUARIOS_HASH_FIELD_ID;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const documento = searchParams.get('documento');

    if (!documento) {
      return NextResponse.json({ error: 'Documento requerido' }, { status: 400 });
    }

    console.log('🔍 [DEBUG] Consultando usuario con documento:', documento);
    console.log('🔍 [DEBUG] Field IDs:', {
      USUARIOS_NUMERO_DOCUMENTO_FIELD_ID,
      USUARIOS_HASH_FIELD_ID,
      USUARIOS_TABLE_ID
    });

    const filterFormula = `{${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}} = "${documento}"`;
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`;
    
    console.log('🔍 [DEBUG] URL de consulta:', url);
    console.log('🔍 [DEBUG] Filtro:', filterFormula);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ [DEBUG] Error consultando Airtable:', response.status, error);
      return NextResponse.json({ error: `Error consultando base de datos: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    
    console.log('📋 [DEBUG] Respuesta completa de Airtable:', JSON.stringify(data, null, 2));

    if (!data.records || data.records.length === 0) {
      return NextResponse.json({ 
        found: false, 
        message: 'Usuario no encontrado',
        searchedDocument: documento 
      });
    }

    const user = data.records[0];
    const hashValue = user.fields[USUARIOS_HASH_FIELD_ID!] || user.fields['Hash'];

    console.log('🔍 [DEBUG] Análisis detallado del usuario:', {
      id: user.id,
      allFields: user.fields,
      hashFieldId: USUARIOS_HASH_FIELD_ID,
      hashValueById: user.fields[USUARIOS_HASH_FIELD_ID!],
      hashValueByName: user.fields['Hash'],
      finalHashValue: hashValue,
      hashType: typeof hashValue,
      hashExists: !!hashValue,
      hashEmpty: hashValue === '' || hashValue === null || hashValue === undefined,
      isFirstLogin: !hashValue || hashValue === '' || hashValue === null
    });

    return NextResponse.json({
      found: true,
      user: {
        id: user.id,
        fields: user.fields,
        hashValue: hashValue,
        isFirstLogin: !hashValue || hashValue === '' || hashValue === null
      },
      debug: {
        fieldIds: {
          documento: USUARIOS_NUMERO_DOCUMENTO_FIELD_ID,
          hash: USUARIOS_HASH_FIELD_ID
        }
      }
    });

  } catch (error) {
    console.error('💥 [DEBUG] Error:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
