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
  console.log('🔧 Iniciando reseteo de contraseña para usuario raíz real...');
  
  try {
    const { userId, newPassword } = await request.json();
    
    if (!userId || !newPassword) {
      return NextResponse.json({ 
        error: 'ID del usuario y nueva contraseña son requeridos' 
      }, { status: 400 });
    }

    console.log('🔧 Reseteando contraseña para usuario ID:', userId);

    // Generar salt y hash para la nueva contraseña
    const salt = generateSalt();
    const passwordHash = hashPassword(newPassword, salt);
    
    console.log('🔑 Nuevas credenciales generadas:');
    console.log('   - Salt:', salt.length, 'caracteres');
    console.log('   - Hash:', passwordHash.length, 'caracteres');

    // Preparar datos de actualización
    const updateData = {
      records: [{
        id: userId,
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

    console.log('🔧 Actualizando usuario raíz con nuevas credenciales...');

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
      console.error('❌ Error actualizando usuario raíz:', errorText);
      return NextResponse.json({ 
        error: 'Error actualizando credenciales del usuario raíz' 
      }, { status: 500 });
    }

    const result = await updateResponse.json();
    console.log('✅ Usuario raíz actualizado exitosamente');

    return NextResponse.json({ 
      success: true,
      message: 'Contraseña del usuario raíz actualizada exitosamente',
      userId: userId,
      newPasswordSet: true
    });

  } catch (error) {
    console.error('💥 Error en reseteo de contraseña:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
