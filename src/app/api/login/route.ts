import { NextRequest, NextResponse } from 'next/server';
import { pbkdf2Sync } from 'crypto';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;

// Field IDs para Usuarios
const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID;
const USUARIOS_HASH_FIELD_ID = process.env.USUARIOS_HASH_FIELD_ID;
const USUARIOS_SALT_FIELD_ID = process.env.USUARIOS_SALT_FIELD_ID;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID;
const USUARIOS_ROL_USUARIO_FIELD_ID = process.env.USUARIOS_ROL_USUARIO_FIELD_ID;
const USUARIOS_ENTIDAD_FIELD_ID = process.env.USUARIOS_ENTIDAD_FIELD_ID;

// Validar que todas las variables de entorno necesarias estén configuradas
const requiredEnvVars = [
  'USUARIOS_TABLE_ID',
  'USUARIOS_NOMBRE_COMPLETO_FIELD_ID',
  'USUARIOS_HASH_FIELD_ID',
  'USUARIOS_SALT_FIELD_ID',
  'USUARIOS_NUMERO_DOCUMENTO_FIELD_ID',
  'USUARIOS_AREA_EMPRESA_FIELD_ID',
  'USUARIOS_ROL_USUARIO_FIELD_ID',
  'USUARIOS_ENTIDAD_FIELD_ID'
];

const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Variables de entorno faltantes en login API:', missingEnvVars);
  throw new Error(`Variables de entorno faltantes: ${missingEnvVars.join(', ')}`);
}

// Función para verificar contraseña
function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return derivedHash === hash;
  } catch (error) {
    console.error('Error en verificación de contraseña:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString();
  console.log(`🔐 [${requestId}] Iniciando proceso de login`);

  try {
    const { usuario, password } = await request.json();

    if (!usuario || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    console.log(`🔧 [${requestId}] Debug variables de entorno:`, {
      USUARIOS_TABLE_ID,
      USUARIOS_HASH_FIELD_ID,
      USUARIOS_SALT_FIELD_ID,
      USUARIOS_NOMBRE_COMPLETO_FIELD_ID,
      USUARIOS_NUMERO_DOCUMENTO_FIELD_ID,
      USUARIOS_AREA_EMPRESA_FIELD_ID,
      USUARIOS_ROL_USUARIO_FIELD_ID
    });

    // Buscar usuario por número de documento
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID!}`;
    const searchParams = new URLSearchParams({
      filterByFormula: `{${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID!}} = "${usuario}"`
    });

    console.log(`🔍 [${requestId}] Buscando usuario con documento: ${usuario}`);

    const response = await fetch(`${airtableUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data.records && data.records.length > 0) {
        const userRecord = data.records[0];
        const userFields = userRecord.fields;
        
        // Debug: mostrar todos los campos disponibles
        console.log(`🔍 [${requestId}] DEBUG - Campos disponibles:`, Object.keys(userFields));
        console.log(`🔍 [${requestId}] DEBUG - Field IDs usados:`, {
          USUARIOS_HASH_FIELD_ID,
          USUARIOS_SALT_FIELD_ID,
          USUARIOS_NOMBRE_COMPLETO_FIELD_ID,
          USUARIOS_NUMERO_DOCUMENTO_FIELD_ID,
          USUARIOS_AREA_EMPRESA_FIELD_ID,
          USUARIOS_ROL_USUARIO_FIELD_ID
        });
        
        // Intentar acceder por field ID y por nombre
        const storedHash = userFields[USUARIOS_HASH_FIELD_ID!] || userFields['Hash'];
        const storedSalt = userFields[USUARIOS_SALT_FIELD_ID!] || userFields['Salt'];
        const nombreCompleto = userFields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID!] || userFields['Nombre Completo'];
        const userDocumento = userFields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID!] || userFields['Numero Documento'];
        const userAreaEmpresa = userFields[USUARIOS_AREA_EMPRESA_FIELD_ID!] || userFields['Area Empresa'];
        const userRol = userFields[USUARIOS_ROL_USUARIO_FIELD_ID!] || userFields['Rol Usuario'];
        const nombreRazonSocial = userFields['fldOpHYIPSyFdl6A7'] || userFields['Nombre o Razón Social (from Entidad)']; // Lookup de Nombre o Razón Social

        console.log(`🔍 [${requestId}] Usuario encontrado: ${nombreCompleto}, Documento: ${userDocumento}`);
        console.log(`🔍 [${requestId}] Debug valores:`, {
          storedHash: storedHash ? '***PRESENTE***' : 'AUSENTE',
          storedSalt: storedSalt ? '***PRESENTE***' : 'AUSENTE',
          nombreCompleto,
          userDocumento,
          userRol
        });

        if (!storedHash || !storedSalt) {
          console.log(`❌ [${requestId}] Configuración de usuario incompleta`);
          return NextResponse.json({ error: 'Error de configuración de usuario' }, { status: 500 });
        }

        // Verificar contraseña
        const isPasswordValid = verifyPassword(password, storedHash, storedSalt);

        if (!isPasswordValid) {
          console.log(`❌ [${requestId}] Contraseña inválida para usuario: ${usuario}`);
          return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Obtener el nombre de la empresa desde el lookup field
        const empresaNombre = nombreRazonSocial && nombreRazonSocial.length > 0 ? nombreRazonSocial[0] : 'Empresa no especificada';

        // Obtener el ID de la entidad del usuario
        const entidadField = userFields[USUARIOS_ENTIDAD_FIELD_ID!] || userFields['Entidad'];
        const entidadId = entidadField && Array.isArray(entidadField) && entidadField.length > 0 ? entidadField[0] : null;

        // Preparar respuesta de login exitoso
        const userData = {
          id: userRecord.id,
          usuario: userDocumento, // Usar el documento como identificador de usuario
          nombre: nombreCompleto,
          empresa: empresaNombre,
          documento: userDocumento,
          tipoUsuario: userRol === 'Usuario Raiz' ? 'raiz' : 'regular',
          rol: userRol,
          areaEmpresa: userAreaEmpresa,
          entidadId: entidadId
        };

        console.log(`✅ [${requestId}] Login exitoso para usuario: ${nombreCompleto} (${userDocumento})`);

        return NextResponse.json({
          success: true,
          message: 'Login exitoso',
          user: userData
        });
      }
    }

    // Usuario no encontrado
    console.log(`❌ [${requestId}] Usuario no encontrado con documento: ${usuario}`);
    return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });

  } catch (error) {
    console.error(`Error en proceso de login:`, error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}