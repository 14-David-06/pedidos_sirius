import { NextRequest, NextResponse } from 'next/server';
import { pbkdf2Sync } from 'crypto';

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

// Función para verificar contraseña en modo desarrollo
function verifyLocalPassword(password: string, storedPassword: string): boolean {
  return password === storedPassword;
}

export async function POST(request: NextRequest) {
  console.log('🔐 Iniciando proceso de login...');
  
  try {
    const { usuario, password, tipoUsuarioPreferido } = await request.json();
    
    console.log('📝 Datos recibidos:', { 
      usuario: usuario || 'undefined', 
      hasPassword: !!password,
      tipoUsuarioPreferido: tipoUsuarioPreferido || 'no especificado'
    });

    if (!usuario || !password) {
      console.log('❌ Faltan datos requeridos');
      return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    // Validar que todas las variables de entorno requeridas estén configuradas
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USUARIOS_TABLE_ID || !USUARIOS_RAIZ_TABLE_ID ||
        !USUARIOS_USUARIO_FIELD_ID || !USUARIOS_HASH_FIELD_ID || !USUARIOS_SALT_FIELD_ID ||
        !USUARIOS_NUMERO_DOCUMENTO_FIELD_ID || !USUARIOS_AREA_EMPRESA_FIELD_ID || !USUARIOS_ROL_USUARIO_FIELD_ID ||
        !USUARIOS_RAIZ_USUARIO_FIELD_ID || !USUARIOS_RAIZ_HASH_FIELD_ID || !USUARIOS_RAIZ_SALT_FIELD_ID ||
        !USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID || !USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID) {
      console.error('❌ Error de configuración: faltan variables de entorno requeridas para login');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Modo producción - usar Airtable
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.log('❌ Error de configuración del servidor');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    let userFound = null;
    let tipoUsuario = null;

    console.log('🎯 [LOGIN] Estrategia de búsqueda basada en selección del usuario:', tipoUsuarioPreferido);

    // Si no se especifica tipo o es undefined, intentar primero en usuarios raíz por defecto
    const tipoUsuarioFinal = tipoUsuarioPreferido || 'raiz';
    console.log('🎯 [LOGIN] Tipo de usuario final a buscar:', tipoUsuarioFinal);

    // Buscar SOLO en la tabla seleccionada por el usuario
    if (tipoUsuarioFinal === 'raiz') {
      // Buscar únicamente en Usuarios Raíz
      console.log('🔍 [LOGIN] Buscando en tabla Usuarios Raíz...');
      if (USUARIOS_RAIZ_TABLE_ID && USUARIOS_RAIZ_USUARIO_FIELD_ID) {
        const airtableUrlRaiz = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}`;
        
        const searchParamsRaiz = new URLSearchParams({
          filterByFormula: `{${USUARIOS_RAIZ_USUARIO_FIELD_ID}} = "${usuario}"`
        });

        console.log('🔍 [LOGIN] URL de búsqueda Usuarios Raíz:', `${airtableUrlRaiz}?${searchParamsRaiz}`);

        try {
          const responseRaiz = await fetch(`${airtableUrlRaiz}?${searchParamsRaiz}`, {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            }
          });

          if (responseRaiz.ok) {
            const dataRaiz = await responseRaiz.json();
            console.log('📋 [LOGIN] Usuarios Raíz encontrados:', dataRaiz.records.length);
            
            if (dataRaiz.records.length > 0) {
              userFound = dataRaiz.records[0];
              tipoUsuario = 'raiz';
              console.log('✅ [LOGIN] Usuario encontrado en tabla Usuarios Raíz');
            } else {
              console.log('❌ [LOGIN] Usuario no encontrado en tabla Usuarios Raíz');
            }
          } else {
            console.log('⚠️ [LOGIN] Error HTTP al buscar en Usuarios Raíz:', responseRaiz.status);
          }
        } catch (error) {
          console.log('⚠️ [LOGIN] Error al buscar en Usuarios Raíz:', error);
        }
      } else {
        console.log('❌ [LOGIN] Configuración incompleta para Usuarios Raíz');
      }
    } else {
      // Buscar únicamente en Usuarios regulares por DOCUMENTO (ya no tienen campo usuario)
      console.log('🔍 [LOGIN] Buscando en tabla Usuarios regulares por número de documento...');
      if (USUARIOS_TABLE_ID && USUARIOS_NUMERO_DOCUMENTO_FIELD_ID) {
        const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`;
        
        const searchParams = new URLSearchParams({
          filterByFormula: `{${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}} = "${usuario}"`
        });

        console.log('🔍 [LOGIN] URL de búsqueda Usuarios regulares:', `${airtableUrl}?${searchParams}`);

        try {
          const response = await fetch(`${airtableUrl}?${searchParams}`, {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            }
          });

          if (response.ok) {
            const data = await response.json();
            console.log('📋 [LOGIN] Usuarios regulares encontrados:', data.records.length);
            
            if (data.records.length > 0) {
              userFound = data.records[0];
              tipoUsuario = 'regular';
              console.log('✅ [LOGIN] Usuario encontrado en tabla Usuarios regulares');
            } else {
              console.log('❌ [LOGIN] Usuario no encontrado en tabla Usuarios regulares');
            }
          } else {
            console.log('⚠️ [LOGIN] Error HTTP al buscar en Usuarios regulares:', response.status);
          }
        } catch (error) {
          console.log('⚠️ [LOGIN] Error al buscar en Usuarios regulares:', error);
        }
        } else {
        console.log('❌ [LOGIN] Configuración incompleta para Usuarios regulares');
      }
    }

    if (!userFound) {
      const tablaSeleccionada = tipoUsuarioPreferido === 'raiz' ? 'Usuarios Raíz' : 'Usuarios Regulares';
      const criterioBusqueda = tipoUsuarioPreferido === 'raiz' ? 'nombre de usuario' : 'número de documento';
      console.log(`❌ [LOGIN] Usuario "${usuario}" no encontrado en la tabla ${tablaSeleccionada}`);
      return NextResponse.json({ 
        error: `${criterioBusqueda === 'nombre de usuario' ? 'Usuario' : 'Documento'} no encontrado en la tabla de ${tablaSeleccionada}. Verifica el ${criterioBusqueda} o selecciona el tipo correcto.` 
      }, { status: 404 });
    }    const userFields = userFound.fields;
    
    console.log('👤 [LOGIN] Usuario encontrado:', {
      id: userFound.id,
      tipoUsuario: tipoUsuario,
      tipoSeleccionado: tipoUsuarioPreferido,
      coincide: tipoUsuario === tipoUsuarioPreferido
    });

    // Obtener los field IDs correctos según el tipo de usuario
    const hashFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_HASH_FIELD_ID : USUARIOS_HASH_FIELD_ID;
    const saltFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_SALT_FIELD_ID : USUARIOS_SALT_FIELD_ID;
    const nombreFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID : null;
    const documentoFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID : USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;

    // Primero intentar con Field IDs, luego con nombres de campo como fallback
    let storedHash = userFields[hashFieldId!] || userFields['Hash'];
    let storedSalt = userFields[saltFieldId!] || userFields['Salt'];

    console.log('🔑 [LOGIN] Credenciales:', {
      hashFieldId,
      saltFieldId,
      hasHash: !!storedHash,
      hasSalt: !!storedSalt,
      hashLength: storedHash?.length || 0,
      saltLength: storedSalt?.length || 0,
      accessMethod: storedHash ? (userFields[hashFieldId!] ? 'fieldId' : 'fieldName') : 'none'
    });

    if (!storedHash || !storedSalt) {
      console.log('❌ [LOGIN] Usuario encontrado pero sin configuración de seguridad:', {
        hasHash: !!storedHash,
        hasSalt: !!storedSalt,
        hashValue: storedHash ? `${storedHash.substring(0, 10)}...` : 'null',
        saltValue: storedSalt ? `${storedSalt.substring(0, 10)}...` : 'null'
      });
      return NextResponse.json({ 
        error: `El usuario existe pero no tiene configuración de seguridad válida en la tabla de ${tipoUsuario === 'raiz' ? 'Usuarios Raíz' : 'Usuarios Regulares'}` 
      }, { status: 400 });
    }

    // Verificar la contraseña
    console.log('🔑 [LOGIN] Verificando contraseña...');
    const isPasswordValid = verifyPassword(password, storedHash, storedSalt);

    console.log('🔑 [LOGIN] Resultado de verificación:', {
      passwordValid: isPasswordValid,
      passwordLength: password.length,
      storedHashStart: storedHash.substring(0, 10) + '...',
      storedSaltStart: storedSalt.substring(0, 10) + '...'
    });

    if (!isPasswordValid) {
      console.log('❌ [LOGIN] Contraseña incorrecta');
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log('✅ Login exitoso');
    
    // Obtener el nombre correcto según el tipo de usuario
    let nombreUsuario = '';
    if (tipoUsuario === 'raiz') {
      nombreUsuario = nombreFieldId ? userFields[nombreFieldId] : 'Usuario Raíz';
    } else {
      // Para usuarios regulares, usar el campo nombre completo con fallback
      const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID;
      nombreUsuario = (USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? userFields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null) 
                     || userFields['Nombre Completo'] 
                     || 'Usuario Regular';
    }
    
    const userData = {
      id: userFound.id,
      usuario: tipoUsuario === 'raiz' ? usuario : userFields[documentoFieldId!], // Para regulares usar documento como "usuario"
      nombre: nombreUsuario,
      documento: userFields[documentoFieldId!],
      tipoUsuario: tipoUsuario,
      rol: tipoUsuario === 'regular' 
           ? (userFields[USUARIOS_ROL_USUARIO_FIELD_ID!] || userFields['Rol Usuario']) 
           : undefined,
      areaEmpresa: tipoUsuario === 'regular' 
                   ? (userFields[USUARIOS_AREA_EMPRESA_FIELD_ID!] || userFields['Area Empresa']) 
                   : undefined
    };

    console.log('👤 [LOGIN] Datos del usuario final:', {
      id: userData.id,
      nombre: userData.nombre,
      tipoUsuario: userData.tipoUsuario,
      rol: userData.rol,
      areaEmpresa: userData.areaEmpresa,
      rolFieldId: USUARIOS_ROL_USUARIO_FIELD_ID,
      rolByFieldId: userFields[USUARIOS_ROL_USUARIO_FIELD_ID!],
      rolByFieldName: userFields['Rol Usuario']
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Login exitoso',
      user: userData
    });

  } catch (error) {
    console.error('💥 Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
