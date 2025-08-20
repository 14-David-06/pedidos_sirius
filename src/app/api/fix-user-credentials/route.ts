import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;
const USUARIOS_RAIZ_HASH_FIELD_ID = process.env.USUARIOS_RAIZ_HASH_FIELD_ID;
const USUARIOS_RAIZ_SALT_FIELD_ID = process.env.USUARIOS_RAIZ_SALT_FIELD_ID;

// Función para generar hash de contraseña
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Función para generar salt aleatorio
function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  console.log('🔧 Iniciando actualización de credenciales de usuario...');
  
  try {
    const { recordId, password } = await request.json();
    
    if (!recordId || !password) {
      return NextResponse.json({ 
        error: 'ID del registro y contraseña son requeridos' 
      }, { status: 400 });
    }

    console.log('🔧 Actualizando usuario con ID:', recordId);

    // Generar salt y hash para la contraseña
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    
    console.log('🔑 Credenciales generadas:');
    console.log('   - Salt:', salt.length, 'caracteres');
    console.log('   - Hash:', passwordHash.length, 'caracteres');

    // Preparar datos de actualización
    const updateData = {
      records: [{
        id: recordId,
        fields: {} as any
      }]
    };

    const fields = updateData.records[0].fields;
    
    if (USUARIOS_RAIZ_HASH_FIELD_ID) {
      fields[USUARIOS_RAIZ_HASH_FIELD_ID] = passwordHash;
    }
    
    if (USUARIOS_RAIZ_SALT_FIELD_ID) {
      fields[USUARIOS_RAIZ_SALT_FIELD_ID] = salt;
    }

    console.log('🔧 Datos a actualizar:', JSON.stringify(updateData, null, 2));

    // Actualizar registro en Airtable
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log('🔧 Respuesta de actualización:', updateResponse.status, updateResponse.statusText);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Error actualizando usuario:', errorText);
      return NextResponse.json({ 
        error: 'Error actualizando credenciales del usuario' 
      }, { status: 500 });
    }

    const result = await updateResponse.json();
    console.log('✅ Usuario actualizado exitosamente');

    return NextResponse.json({ 
      success: true,
      message: 'Credenciales actualizadas exitosamente',
      result: result
    });

  } catch (error) {
    console.error('💥 Error en actualización:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
