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
    console.log(`🔐 [VERIFY] Iniciando verificación de contraseña`);
    console.log(`🔐 [VERIFY] Parámetros:`);
    console.log(`   - Longitud contraseña: ${password.length} caracteres`);
    console.log(`   - Longitud hash: ${hash.length} caracteres`);
    console.log(`   - Longitud salt: ${salt.length} caracteres`);

    const derivedHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

    console.log(`🔐 [VERIFY] Hash derivado generado`);
    console.log(`   - Algoritmo: PBKDF2-SHA512`);
    console.log(`   - Iteraciones: 10000`);
    console.log(`   - Longitud salida: 64 bytes (${derivedHash.length} caracteres hex)`);

    const isValid = derivedHash === hash;

    console.log(`🔐 [VERIFY] Comparación de hashes:`);
    console.log(`   - Hash esperado: ${hash.substring(0, 20)}...`);
    console.log(`   - Hash calculado: ${derivedHash.substring(0, 20)}...`);
    console.log(`   - Coinciden: ${isValid ? '✅ SÍ' : '❌ NO'}`);

    return isValid;
  } catch (error) {
    console.error(`💥 [VERIFY] Error crítico en verificación de contraseña:`, error);
    return false;
  }
}

// Función para verificar contraseña en modo desarrollo
function verifyLocalPassword(password: string, storedPassword: string): boolean {
  console.log(`🔐 [LOCAL_VERIFY] Verificación de contraseña en modo local`);
  console.log(`🔐 [LOCAL_VERIFY] Comparando:`);
  console.log(`   - Contraseña proporcionada: "${password}"`);
  console.log(`   - Contraseña almacenada: "${storedPassword}"`);

  const isValid = password === storedPassword;

  console.log(`🔐 [LOCAL_VERIFY] Resultado: ${isValid ? '✅ Contraseñas coinciden' : '❌ Contraseñas diferentes'}`);

  return isValid;
}

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString();
  console.log(`🔐 [${requestId}] ===== INICIANDO PROCESO DE LOGIN =====`);

  try {
    const { usuario, password, tipoUsuarioPreferido } = await request.json();

    console.log(`📝 [${requestId}] Datos recibidos:`, {
      usuario: usuario || 'undefined',
      hasPassword: !!password,
      passwordLength: password?.length || 0,
      tipoUsuarioPreferido: tipoUsuarioPreferido || 'no especificado'
    });

    if (!usuario || !password) {
      console.log(`❌ [${requestId}] Faltan datos requeridos - usuario o password`);
      return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    // ===== VALIDACIÓN DE CONFIGURACIÓN =====
    console.log(`⚙️ [${requestId}] ===== VALIDANDO CONFIGURACIÓN =====`);

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

    if (missingVars.length > 0) {
      console.error(`❌ [${requestId}] Variables de entorno faltantes:`, missingVars);
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    console.log(`✅ [${requestId}] Todas las variables de entorno están configuradas`);

    // ===== ESTRATEGIA DE BÚSQUEDA =====
    console.log(`🎯 [${requestId}] ===== DETERMINANDO ESTRATEGIA DE BÚSQUEDA =====`);

    const tipoUsuarioFinal = tipoUsuarioPreferido || 'raiz';
    console.log(`🎯 [${requestId}] Tipo de usuario final a buscar: ${tipoUsuarioFinal}`);
    console.log(`🎯 [${requestId}] Usuario a buscar: "${usuario}"`);

    let userFound = null;
    let tipoUsuario = null;

    if (tipoUsuarioFinal === 'raiz') {
      // ===== BÚSQUEDA EN USUARIOS RAÍZ =====
      console.log(`🔍 [${requestId}] ===== BUSCANDO EN USUARIOS RAÍZ =====`);

      if (!USUARIOS_RAIZ_TABLE_ID || !USUARIOS_RAIZ_USUARIO_FIELD_ID) {
        console.log(`❌ [${requestId}] Configuración incompleta para Usuarios Raíz`);
        return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
      }

      const airtableUrlRaiz = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}`;
      const searchParamsRaiz = new URLSearchParams({
        filterByFormula: `{${USUARIOS_RAIZ_USUARIO_FIELD_ID}} = "${usuario}"`
      });

      console.log(`🔍 [${requestId}] URL de búsqueda: ${airtableUrlRaiz}?${searchParamsRaiz}`);
      console.log(`🔍 [${requestId}] Field ID usuario: ${USUARIOS_RAIZ_USUARIO_FIELD_ID}`);

      try {
        const responseRaiz = await fetch(`${airtableUrlRaiz}?${searchParamsRaiz}`, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        console.log(`📡 [${requestId}] Respuesta HTTP Usuarios Raíz: ${responseRaiz.status} ${responseRaiz.statusText}`);

        if (responseRaiz.ok) {
          const dataRaiz = await responseRaiz.json();
          console.log(`📋 [${requestId}] Registros encontrados en Usuarios Raíz: ${dataRaiz.records.length}`);

          if (dataRaiz.records.length > 0) {
            userFound = dataRaiz.records[0];
            tipoUsuario = 'raiz';
            console.log(`✅ [${requestId}] Usuario RAÍZ encontrado exitosamente`);
            console.log(`👤 [${requestId}] ID del usuario raíz: ${userFound.id}`);
            console.log(`📊 [${requestId}] Campos disponibles: ${Object.keys(userFound.fields).join(', ')}`);
          } else {
            console.log(`❌ [${requestId}] Usuario "${usuario}" NO encontrado en Usuarios Raíz`);
          }
        } else {
          const errorText = await responseRaiz.text();
          console.log(`⚠️ [${requestId}] Error HTTP en búsqueda Usuarios Raíz: ${responseRaiz.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`💥 [${requestId}] Error de conexión al buscar en Usuarios Raíz:`, error);
      }
    } else {
      // ===== BÚSQUEDA EN USUARIOS REGULARES =====
      console.log(`🔍 [${requestId}] ===== BUSCANDO EN USUARIOS REGULARES =====`);

      if (!USUARIOS_TABLE_ID || !USUARIOS_NUMERO_DOCUMENTO_FIELD_ID) {
        console.log(`❌ [${requestId}] Configuración incompleta para Usuarios Regulares`);
        return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
      }

      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`;
      const searchParams = new URLSearchParams({
        filterByFormula: `{${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}} = "${usuario}"`
      });

      console.log(`🔍 [${requestId}] URL de búsqueda: ${airtableUrl}?${searchParams}`);
      console.log(`🔍 [${requestId}] Field ID documento: ${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}`);

      try {
        const response = await fetch(`${airtableUrl}?${searchParams}`, {
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          }
        });

        console.log(`📡 [${requestId}] Respuesta HTTP Usuarios Regulares: ${response.status} ${response.statusText}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`📋 [${requestId}] Registros encontrados en Usuarios Regulares: ${data.records?.length || 0}`);

          if (data.records && data.records.length > 0) {
            userFound = data.records[0];
            tipoUsuario = 'regular';
            console.log(`✅ [${requestId}] Usuario REGULAR encontrado exitosamente`);
            console.log(`👤 [${requestId}] ID del usuario regular: ${userFound.id}`);
            console.log(`📊 [${requestId}] Campos disponibles: ${Object.keys(userFound.fields).join(', ')}`);
            console.log(`📊 [${requestId}] Datos del usuario:`, {
              documento: userFound.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID || 'Numero Documento'],
              nombre: userFound.fields[USUARIOS_AREA_EMPRESA_FIELD_ID || 'Nombre Completo'],
              area: userFound.fields[USUARIOS_AREA_EMPRESA_FIELD_ID || 'Area Empresa'],
              hasHash: !!userFound.fields[USUARIOS_HASH_FIELD_ID || 'Hash'],
              hasSalt: !!userFound.fields[USUARIOS_SALT_FIELD_ID || 'Salt']
            });
          } else {
            console.log(`❌ [${requestId}] Usuario "${usuario}" NO encontrado en Usuarios Regulares`);
            console.log(`🔍 [${requestId}] Tabla consultada: ${USUARIOS_TABLE_ID}`);
            console.log(`🔍 [${requestId}] Field ID usado: ${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}`);
          }
        } else {
          const errorText = await response.text();
          console.log(`⚠️ [${requestId}] Error HTTP en búsqueda Usuarios Regulares: ${response.status} - ${errorText}`);
          console.log(`🔍 [${requestId}] URL consultada: ${airtableUrl}?${searchParams}`);
        }
      } catch (error) {
        console.log(`💥 [${requestId}] Error de conexión al buscar en Usuarios Regulares:`, error);
        console.log(`🔍 [${requestId}] Detalles de conexión:`, {
          url: airtableUrl,
          params: searchParams.toString(),
          hasApiKey: !!AIRTABLE_API_KEY
        });
      }
    }

    // ===== VALIDACIÓN DE USUARIO ENCONTRADO =====
    if (!userFound) {
      const tablaSeleccionada = tipoUsuarioPreferido === 'raiz' ? 'Usuarios Raíz' : 'Usuarios Regulares';
      const criterioBusqueda = tipoUsuarioPreferido === 'raiz' ? 'nombre de usuario' : 'número de documento';

      console.log(`❌ [${requestId}] Usuario "${usuario}" no encontrado en ${tablaSeleccionada}`);
      console.log(`💡 [${requestId}] Sugerencia: Verificar ${criterioBusqueda} o seleccionar tipo correcto`);

      return NextResponse.json({
        error: `${criterioBusqueda === 'nombre de usuario' ? 'Usuario' : 'Documento'} no encontrado en la tabla de ${tablaSeleccionada}. Verifica el ${criterioBusqueda} o selecciona el tipo correcto.`
      }, { status: 404 });
    }

    const userFields = userFound.fields;
    console.log(`👤 [${requestId}] ===== PROCESANDO USUARIO ENCONTRADO =====`);
    console.log(`👤 [${requestId}] Tipo de usuario encontrado: ${tipoUsuario}`);
    console.log(`👤 [${requestId}] Tipo de usuario solicitado: ${tipoUsuarioPreferido}`);
    console.log(`👤 [${requestId}] Coincide la selección: ${tipoUsuario === tipoUsuarioPreferido}`);

    // ===== CONFIGURACIÓN DE CAMPOS SEGÚN TIPO =====
    console.log(`⚙️ [${requestId}] ===== CONFIGURANDO CAMPOS SEGÚN TIPO DE USUARIO =====`);

    const hashFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_HASH_FIELD_ID : USUARIOS_HASH_FIELD_ID;
    const saltFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_SALT_FIELD_ID : USUARIOS_SALT_FIELD_ID;
    const nombreFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_NOMBRE_RAZON_SOCIAL_FIELD_ID : null;
    const documentoFieldId = tipoUsuario === 'raiz' ? USUARIOS_RAIZ_NUMERO_DOCUMENTO_FIELD_ID : USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;

    console.log(`📋 [${requestId}] Field IDs configurados:`);
    console.log(`   - Hash Field ID: ${hashFieldId}`);
    console.log(`   - Salt Field ID: ${saltFieldId}`);
    console.log(`   - Nombre Field ID: ${nombreFieldId || 'N/A'}`);
    console.log(`   - Documento Field ID: ${documentoFieldId}`);

    // ===== EXTRACCIÓN DE CREDENCIALES =====
    console.log(`🔑 [${requestId}] ===== EXTRAYENDO CREDENCIALES =====`);

    let storedHash = userFields[hashFieldId!] || userFields['Hash'];
    let storedSalt = userFields[saltFieldId!] || userFields['Salt'];

    console.log(`🔑 [${requestId}] Estado de credenciales:`);
    console.log(`   - Hash encontrado: ${!!storedHash}`);
    console.log(`   - Salt encontrado: ${!!storedSalt}`);
    console.log(`   - Método de acceso hash: ${storedHash ? (userFields[hashFieldId!] ? 'Field ID' : 'Nombre de campo') : 'Ninguno'}`);
    console.log(`   - Método de acceso salt: ${storedSalt ? (userFields[saltFieldId!] ? 'Field ID' : 'Nombre de campo') : 'Ninguno'}`);

    if (storedHash) {
      console.log(`   - Longitud hash: ${storedHash.length} caracteres`);
      console.log(`   - Hash preview: ${storedHash.substring(0, 20)}...`);
    }
    if (storedSalt) {
      console.log(`   - Longitud salt: ${storedSalt.length} caracteres`);
      console.log(`   - Salt preview: ${storedSalt.substring(0, 20)}...`);
    }

    if (!storedHash || !storedSalt) {
      console.log(`❌ [${requestId}] Usuario encontrado pero sin configuración de seguridad completa`);
      console.log(`   - Hash presente: ${!!storedHash}`);
      console.log(`   - Salt presente: ${!!storedSalt}`);

      const tablaNombre = tipoUsuario === 'raiz' ? 'Usuarios Raíz' : 'Usuarios Regulares';
      return NextResponse.json({
        error: `El usuario existe pero no tiene configuración de seguridad válida en la tabla de ${tablaNombre}`
      }, { status: 400 });
    }

    // ===== VERIFICACIÓN DE CONTRASEÑA =====
    console.log(`🔐 [${requestId}] ===== VERIFICANDO CONTRASEÑA =====`);
    console.log(`� [${requestId}] Iniciando verificación de contraseña...`);

    const isPasswordValid = verifyPassword(password, storedHash, storedSalt);

    console.log(`� [${requestId}] Resultado de verificación:`);
    console.log(`   - Contraseña válida: ${isPasswordValid}`);
    console.log(`   - Longitud contraseña proporcionada: ${password.length} caracteres`);
    console.log(`   - Algoritmo: PBKDF2 con SHA-512`);
    console.log(`   - Iteraciones: 10000`);
    console.log(`   - Longitud derivada: 64 bytes`);

    if (!isPasswordValid) {
      console.log(`❌ [${requestId}] CONTRASEÑA INCORRECTA - Login fallido`);
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log(`✅ [${requestId}] CONTRASEÑA CORRECTA - Procediendo con login exitoso`);

    // ===== EXTRACCIÓN DE DATOS DEL USUARIO =====
    console.log(`👤 [${requestId}] ===== EXTRAYENDO DATOS DEL USUARIO =====`);

    let nombreUsuario = '';
    if (tipoUsuario === 'raiz') {
      nombreUsuario = nombreFieldId ? userFields[nombreFieldId] : 'Usuario Raíz';
      console.log(`👤 [${requestId}] Usuario RAÍZ - Nombre: ${nombreUsuario}`);
    } else {
      const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID;
      nombreUsuario = (USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? userFields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null)
                     || userFields['Nombre Completo']
                     || 'Usuario Regular';
      console.log(`👤 [${requestId}] Usuario REGULAR - Nombre: ${nombreUsuario}`);
      console.log(`👤 [${requestId}] Método de obtención nombre: ${
        USUARIOS_NOMBRE_COMPLETO_FIELD_ID && userFields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID] ? 'Field ID' :
        userFields['Nombre Completo'] ? 'Nombre de campo' : 'Default'
      }`);
    }

    const userData = {
      id: userFound.id,
      usuario: tipoUsuario === 'raiz' ? usuario : userFields[documentoFieldId!],
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

    console.log(`👤 [${requestId}] Datos del usuario final compilados:`);
    console.log(`   - ID: ${userData.id}`);
    console.log(`   - Usuario: ${userData.usuario}`);
    console.log(`   - Nombre: ${userData.nombre}`);
    console.log(`   - Documento: ${userData.documento}`);
    console.log(`   - Tipo: ${userData.tipoUsuario}`);
    if (userData.rol) console.log(`   - Rol: ${userData.rol}`);
    if (userData.areaEmpresa) console.log(`   - Área/Empresa: ${userData.areaEmpresa}`);

    // ===== DEBUGGING DE CAMPOS =====
    if (tipoUsuario === 'regular') {
      console.log(`🐛 [${requestId}] Debug campos usuario regular:`);
      console.log(`   - Rol Field ID: ${USUARIOS_ROL_USUARIO_FIELD_ID}`);
      console.log(`   - Rol por Field ID: ${userFields[USUARIOS_ROL_USUARIO_FIELD_ID!] || 'No encontrado'}`);
      console.log(`   - Rol por nombre campo: ${userFields['Rol Usuario'] || 'No encontrado'}`);
      console.log(`   - Área Field ID: ${USUARIOS_AREA_EMPRESA_FIELD_ID}`);
      console.log(`   - Área por Field ID: ${userFields[USUARIOS_AREA_EMPRESA_FIELD_ID!] || 'No encontrado'}`);
      console.log(`   - Área por nombre campo: ${userFields['Area Empresa'] || 'No encontrado'}`);
    }

    // ===== RESPUESTA EXITOSA =====
    console.log(`🎉 [${requestId}] ===== LOGIN EXITOSO =====`);
    console.log(`🎉 [${requestId}] Preparando respuesta para usuario: ${userData.nombre} (${userData.tipoUsuario})`);

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: userData
    });

  } catch (error) {
    console.error(`💥 [${requestId}] ===== ERROR CRÍTICO EN LOGIN =====`);
    console.error(`💥 [${requestId}] Error:`, error);
    console.error(`💥 [${requestId}] Stack trace:`, error instanceof Error ? error.stack : 'No stack trace available');

    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
