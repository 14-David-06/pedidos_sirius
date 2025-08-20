import { NextRequest, NextResponse } from 'next/server';

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;

export async function POST(request: NextRequest) {
  console.log('🔍 [DEBUG] Iniciando debug del usuario...');
  
  try {
    const { recordId } = await request.json();
    
    if (!recordId) {
      return NextResponse.json({ 
        error: 'ID del registro es requerido' 
      }, { status: 400 });
    }

    console.log('🔍 [DEBUG] Consultando usuario con ID:', recordId);

    // Consultar registro específico en Airtable
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}/${recordId}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('🔍 [DEBUG] Respuesta de Airtable:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [DEBUG] Error consultando usuario:', errorText);
      return NextResponse.json({ 
        error: 'Error consultando usuario' 
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('📋 [DEBUG] Datos completos del usuario:');
    console.log('   - ID:', result.id);
    console.log('   - Created Time:', result.createdTime);
    console.log('   - Fields disponibles:', Object.keys(result.fields));
    
    // Mostrar todos los campos con sus valores
    console.log('📋 [DEBUG] Contenido de todos los campos:');
    for (const [fieldName, fieldValue] of Object.entries(result.fields)) {
      console.log(`   - ${fieldName}:`, typeof fieldValue, fieldValue);
    }

    // Verificar específicamente los campos de hash y salt
    const hashFieldId = process.env.USUARIOS_RAIZ_HASH_FIELD_ID;
    const saltFieldId = process.env.USUARIOS_RAIZ_SALT_FIELD_ID;
    
    const hashValue = result.fields[hashFieldId!];
    const saltValue = result.fields[saltFieldId!];
    
    console.log('🔑 [DEBUG] Campos específicos de seguridad:');
    console.log(`   - Hash Field ID (${hashFieldId}):`, hashValue ? 'PRESENTE' : 'AUSENTE');
    console.log(`   - Salt Field ID (${saltFieldId}):`, saltValue ? 'PRESENTE' : 'AUSENTE');
    
    if (hashValue) {
      console.log(`   - Hash Length:`, hashValue.length);
      console.log(`   - Hash Preview:`, hashValue.substring(0, 20) + '...');
    }
    
    if (saltValue) {
      console.log(`   - Salt Length:`, saltValue.length);
      console.log(`   - Salt Preview:`, saltValue.substring(0, 20) + '...');
    }

    return NextResponse.json({ 
      success: true,
      record: result,
      debug: {
        hasHash: !!hashValue,
        hasSalt: !!saltValue,
        hashFieldId: hashFieldId,
        saltFieldId: saltFieldId,
        allFields: Object.keys(result.fields)
      }
    });

  } catch (error) {
    console.error('💥 [DEBUG] Error en debug:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
