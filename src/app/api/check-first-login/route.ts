import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;

// Field IDs para usuarios regulares
const USUARIOS_HASH_FIELD_ID = process.env.USUARIOS_HASH_FIELD_ID!;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID!;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID!;

export async function POST(request: NextRequest) {
  try {
    const { documento } = await request.json();

    if (!documento || typeof documento !== 'string') {
      return NextResponse.json(
        { error: 'El número de documento es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 [API] Verificando primer login para documento:', documento);

    // Buscar usuario por documento usando la API de Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`;
    const filterFormula = `{${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}} = "${documento}"`;
    
    const response = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ [API] Error consultando Airtable:', response.status, response.statusText);
      throw new Error(`Error consultando base de datos: ${response.status}`);
    }

    const data = await response.json();

    if (!data.records || data.records.length === 0) {
      console.log('❌ [API] Usuario no encontrado:', documento);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = data.records[0];
    // Intentar obtener el hash usando field ID primero, luego el nombre del campo
    const password = user.fields[USUARIOS_HASH_FIELD_ID] || user.fields['Hash'];
    const isFirstLogin = !password || password === '' || password === null;

    console.log('🔍 [API] DEBUG - Campos del usuario:', {
      allFields: user.fields,
      hashFieldId: USUARIOS_HASH_FIELD_ID,
      hashValueById: user.fields[USUARIOS_HASH_FIELD_ID],
      hashValueByName: user.fields['Hash'],
      finalHashValue: password,
      hashType: typeof password,
      isFirstLogin
    });

    console.log('✅ [API] Usuario encontrado:', {
      id: user.id,
      documento: user.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] || user.fields['Numero Documento'],
      hasPassword: !!password,
      isFirstLogin
    });

    return NextResponse.json({
      success: true,
      isFirstLogin,
      userData: {
        id: user.id,
        documento: user.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] || user.fields['Numero Documento'],
        nombre: user.fields[process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID!] || user.fields['Nombre Completo'], // Nombre Completo
        area: user.fields[USUARIOS_AREA_EMPRESA_FIELD_ID] || user.fields['Area Empresa'], // Area Empresa
        rol: user.fields[process.env.USUARIOS_ROL_USUARIO_FIELD_ID!] || user.fields['Rol Usuario'] // Rol Usuario
      }
    });

  } catch (error) {
    console.error('💥 [API] Error verificando primer login:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
