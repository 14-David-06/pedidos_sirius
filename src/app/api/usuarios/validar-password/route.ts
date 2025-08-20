import { NextRequest, NextResponse } from 'next/server';
import { pbkdf2Sync } from 'crypto';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;

// Field IDs para Usuarios Raíz
const USUARIOS_RAIZ_USUARIO_FIELD_ID = process.env.USUARIOS_RAIZ_USUARIO_FIELD_ID;
const USUARIOS_RAIZ_HASH_FIELD_ID = process.env.USUARIOS_RAIZ_HASH_FIELD_ID;
const USUARIOS_RAIZ_SALT_FIELD_ID = process.env.USUARIOS_RAIZ_SALT_FIELD_ID;

// Función para verificar contraseña
function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return derivedHash === hash;
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  console.log('🔐 Iniciando validación de contraseña de usuario raíz...');
  
  try {
    const { usuario, password, userRootId } = await request.json();
    
    console.log('📝 Datos recibidos para validación:', { 
      usuario: usuario || 'undefined', 
      hasPassword: !!password,
      userRootId: userRootId || 'undefined'
    });

    if (!usuario || !password) {
      console.log('❌ Faltan datos requeridos');
      return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.log('❌ Error de configuración del servidor');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    let userFound = null;

    // Buscar ÚNICAMENTE en Usuarios Raíz
    console.log('🔍 [VALIDATE] Buscando en tabla Usuarios Raíz...');
    if (USUARIOS_RAIZ_TABLE_ID && USUARIOS_RAIZ_USUARIO_FIELD_ID) {
      const airtableUrlRaiz = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}`;
      
      const searchParamsRaiz = new URLSearchParams({
        filterByFormula: `{${USUARIOS_RAIZ_USUARIO_FIELD_ID}} = "${usuario}"`
      });

      console.log('🔍 [VALIDATE] URL de búsqueda Usuarios Raíz:', `${airtableUrlRaiz}?${searchParamsRaiz}`);

      try {
        const responseRaiz = await fetch(`${airtableUrlRaiz}?${searchParamsRaiz}`, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        if (responseRaiz.ok) {
          const dataRaiz = await responseRaiz.json();
          console.log('📋 [VALIDATE] Usuarios Raíz encontrados:', dataRaiz.records.length);
          
          if (dataRaiz.records.length > 0) {
            userFound = dataRaiz.records[0];
            console.log('✅ [VALIDATE] Usuario raíz encontrado');
            
            // Si se proporciona userRootId, verificar que coincida
            if (userRootId && userFound.id !== userRootId) {
              console.log('❌ [VALIDATE] ID de usuario raíz no coincide');
              return NextResponse.json({ error: 'Usuario no autorizado' }, { status: 403 });
            }
          } else {
            console.log('❌ [VALIDATE] Usuario raíz no encontrado');
          }
        } else {
          console.log('⚠️ [VALIDATE] Error HTTP al buscar en Usuarios Raíz:', responseRaiz.status);
        }
      } catch (error) {
        console.log('⚠️ [VALIDATE] Error al buscar en Usuarios Raíz:', error);
      }
    } else {
      console.log('❌ [VALIDATE] Configuración incompleta para Usuarios Raíz');
    }

    if (!userFound) {
      console.log(`❌ [VALIDATE] Usuario raíz "${usuario}" no encontrado`);
      return NextResponse.json({ 
        error: 'Usuario raíz no encontrado. Solo los administradores pueden realizar esta acción.' 
      }, { status: 404 });
    }

    const userFields = userFound.fields;
    
    console.log('👤 [VALIDATE] Usuario raíz encontrado:', {
      id: userFound.id,
      usuario: usuario
    });

    // Obtener hash y salt
    let storedHash = userFields[USUARIOS_RAIZ_HASH_FIELD_ID!] || userFields['Hash'];
    let storedSalt = userFields[USUARIOS_RAIZ_SALT_FIELD_ID!] || userFields['Salt'];

    console.log('🔑 [VALIDATE] Credenciales:', {
      hasHash: !!storedHash,
      hasSalt: !!storedSalt,
      hashLength: storedHash?.length || 0,
      saltLength: storedSalt?.length || 0
    });

    if (!storedHash || !storedSalt) {
      console.log('❌ [VALIDATE] Usuario encontrado pero sin configuración de seguridad');
      return NextResponse.json({ 
        error: 'El usuario raíz no tiene configuración de seguridad válida' 
      }, { status: 400 });
    }

    // Verificar la contraseña
    console.log('🔑 [VALIDATE] Verificando contraseña...');
    const isPasswordValid = verifyPassword(password, storedHash, storedSalt);

    console.log('🔑 [VALIDATE] Resultado de verificación:', {
      passwordValid: isPasswordValid
    });

    if (!isPasswordValid) {
      console.log('❌ [VALIDATE] Contraseña incorrecta');
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log('✅ Validación de contraseña exitosa');

    return NextResponse.json({ 
      success: true, 
      message: 'Contraseña validada correctamente',
      userId: userFound.id
    });

  } catch (error) {
    console.error('💥 Error en validación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
