import { NextRequest, NextResponse } from 'next/server';
import { pbkdf2Sync } from 'crypto';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;

// Field IDs
const USUARIO_FIELD_ID = process.env.USUARIO_FIELD_ID;
const HASH_FIELD_ID = process.env.HASH_FIELD_ID;
const SALT_FIELD_ID = process.env.SALT_FIELD_ID;
const NOMBRE_RAZON_SOCIAL_FIELD_ID = process.env.NOMBRE_RAZON_SOCIAL_FIELD_ID;
const DOCUMENTO_FIELD_ID = process.env.DOCUMENTO_FIELD_ID;

// Modo desarrollo local
const isDevelopment = process.env.NODE_ENV === 'development';
const useLocalAuth = isDevelopment && (!AIRTABLE_API_KEY || AIRTABLE_API_KEY.includes('your_'));

// Usuarios de prueba para desarrollo local
const localUsers = [
  {
    id: 'dev-001',
    usuario: 'admin',
    password: 'admin123',
    nombre: 'Administrador Sistema',
    documento: '12345678',
    hash: '7c9e6679f0a36b5b3eb8f26e82d27e5c3c9e6679f0a36b5b3eb8f26e82d27e5c',
    salt: 'dev_salt_123'
  },
  {
    id: 'dev-002', 
    usuario: 'david',
    password: 'david123',
    nombre: 'David Desarrollador',
    documento: '87654321',
    hash: '4f8a2b7e1d9c3e5f7a9b2d4e6f8a0c2e4f8a2b7e1d9c3e5f7a9b2d4e6f8a0c2e',
    salt: 'dev_salt_456'
  },
  {
    id: 'dev-003',
    usuario: 'sirius',
    password: 'sirius2025',
    nombre: 'Sirius Regenerative Solutions',
    documento: '900123456',
    hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
    salt: 'dev_salt_789'
  }
];

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
    const { usuario, password } = await request.json();
    
    console.log('📝 Datos recibidos:', { usuario: usuario || 'undefined', hasPassword: !!password });

    if (!usuario || !password) {
      console.log('❌ Faltan datos requeridos');
      return NextResponse.json({ error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    // Modo desarrollo local - usar usuarios de prueba
    if (useLocalAuth) {
      console.log('🧪 Modo desarrollo local activado');
      
      const localUser = localUsers.find(u => u.usuario === usuario);
      
      if (!localUser) {
        console.log('❌ Usuario no encontrado en modo local');
        return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      }

      // Verificar contraseña en modo desarrollo
      const isPasswordValid = verifyLocalPassword(password, localUser.password);

      if (!isPasswordValid) {
        console.log('❌ Contraseña incorrecta en modo local');
        return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
      }

      console.log('✅ Login exitoso en modo desarrollo local');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Login exitoso (modo desarrollo)',
        user: {
          id: localUser.id,
          usuario: localUser.usuario,
          nombre: localUser.nombre,
          documento: localUser.documento
        },
        development: true
      });
    }

    // Modo producción - usar Airtable
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USUARIOS_TABLE_ID) {
      console.log('❌ Error de configuración del servidor');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Verificar que tenemos todos los field IDs necesarios
    if (!USUARIO_FIELD_ID || !HASH_FIELD_ID || !SALT_FIELD_ID || !NOMBRE_RAZON_SOCIAL_FIELD_ID || !DOCUMENTO_FIELD_ID) {
      console.log('❌ Error de configuración de field IDs');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Buscar el usuario en Airtable por campo usuario
    console.log('🔍 Buscando usuario en Airtable...');
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`;
    
    const searchParams = new URLSearchParams({
      filterByFormula: `{Usuario} = "${usuario}"`
    });

    console.log('🔍 URL de búsqueda:', `${airtableUrl}?${searchParams}`);

    const response = await fetch(`${airtableUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('📡 Respuesta de Airtable:', response.status, response.statusText);

    if (!response.ok) {
      console.log('❌ Error al consultar Airtable');
      return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 });
    }

    const data = await response.json();
    console.log('📋 Usuarios encontrados:', data.records.length);
    
    if (data.records.length === 0) {
      console.log('❌ Usuario no encontrado');
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const userRecord = data.records[0];
    const userFields = userRecord.fields;
    
    console.log('👤 Usuario encontrado:', {
      id: userRecord.id,
      nombre: userFields['Nombre o Razón Social'],
      hasHash: !!userFields['Hash'],
      hasSalt: !!userFields['Salt']
    });

    // Debug adicional: ver todos los campos del usuario
    console.log('🔍 Todos los campos del usuario:', Object.keys(userFields));
    console.log('🔍 Valor del hash:', userFields['Hash'] ? 'PRESENTE' : 'AUSENTE');
    console.log('🔍 Valor del salt:', userFields['Salt'] ? 'PRESENTE' : 'AUSENTE');

    // Verificar que el usuario tenga hash y salt
    const storedHash = userFields['Hash'];
    const storedSalt = userFields['Salt'];

    if (!storedHash || !storedSalt) {
      console.log('❌ Usuario sin configuración de seguridad');
      return NextResponse.json({ error: 'Usuario sin configuración de seguridad válida' }, { status: 400 });
    }

    // Verificar la contraseña
    console.log('🔑 Verificando contraseña...');
    const isPasswordValid = verifyPassword(password, storedHash, storedSalt);

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta');
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    console.log('✅ Login exitoso');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Login exitoso',
      user: {
        id: userRecord.id,
        usuario: userFields['Usuario'],
        nombre: userFields['Nombre o Razón Social'] || '',
        documento: userFields['Numero Documento'] || ''
      }
    });

  } catch (error) {
    console.error('💥 Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
