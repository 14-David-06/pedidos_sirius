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
  console.log('🔧 [REPAIR] Iniciando reparación del usuario guaicaramo...');
  
  try {
    const recordId = 'recYwrjoHVp0mcF4q'; // ID específico del usuario guaicaramo
    const password = 'guaicaramo123'; // Contraseña conocida
    
    console.log('🔧 [REPAIR] Reparando usuario:', {
      recordId,
      passwordSet: !!password,
      hashFieldId: USUARIOS_RAIZ_HASH_FIELD_ID,
      saltFieldId: USUARIOS_RAIZ_SALT_FIELD_ID
    });

    // Generar salt y hash para la contraseña
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    
    console.log('🔑 [REPAIR] Credenciales generadas:', {
      saltLength: salt.length,
      hashLength: passwordHash.length
    });

    // Preparar datos de actualización
    const updateData = {
      records: [{
        id: recordId,
        fields: {
          [USUARIOS_RAIZ_HASH_FIELD_ID!]: passwordHash,
          [USUARIOS_RAIZ_SALT_FIELD_ID!]: salt
        }
      }]
    };

    console.log('📤 [REPAIR] Enviando actualización a Airtable...');

    // Actualizar el registro en Airtable
    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    console.log('📥 [REPAIR] Respuesta de Airtable:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [REPAIR] Error de Airtable:', errorText);
      return NextResponse.json({ 
        error: 'Error al actualizar usuario en Airtable',
        details: errorText 
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('✅ [REPAIR] Usuario reparado exitosamente:', result);

    return NextResponse.json({
      success: true,
      message: 'Usuario guaicaramo reparado exitosamente',
      recordId: recordId,
      saltGenerated: !!salt,
      hashGenerated: !!passwordHash,
      saltLength: salt.length,
      hashLength: passwordHash.length,
      credentials: {
        usuario: 'guaicaramo',
        password: 'guaicaramo123'
      }
    });

  } catch (error) {
    console.error('💥 [REPAIR] Error general:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor durante la reparación',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
