import { NextRequest, NextResponse } from 'next/server';
import { pbkdf2Sync, randomBytes } from 'crypto';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;

// Field IDs para usuarios regulares
const USUARIOS_HASH_FIELD_ID = process.env.USUARIOS_HASH_FIELD_ID!;
const USUARIOS_SALT_FIELD_ID = process.env.USUARIOS_SALT_FIELD_ID!;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID!;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID!;

// Función para hashear contraseña
function hashPassword(password: string, salt: string = ''): { hash: string; salt: string } {
  const newSalt = salt || randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, newSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: newSalt };
}

export async function POST(request: NextRequest) {
  try {
    const { documento, newPassword } = await request.json();

    if (!documento || !newPassword) {
      return NextResponse.json(
        { error: 'Documento y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    console.log('🔐 [API] Configurando contraseña para documento:', documento);
    console.log('👤 [API] Usuario que configurará contraseña:', documento);

    // Buscar usuario por documento usando la API de Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`;
    const filterFormula = `{${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}} = "${documento}"`;
    
    const searchResponse = await fetch(`${url}?filterByFormula=${encodeURIComponent(filterFormula)}&maxRecords=1`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!searchResponse.ok) {
      console.error('❌ [API] Error consultando Airtable:', searchResponse.status);
      throw new Error(`Error consultando base de datos: ${searchResponse.status}`);
    }

    const searchData = await searchResponse.json();

    if (!searchData.records || searchData.records.length === 0) {
      console.log('❌ [API] Usuario no encontrado:', documento);
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    const user = searchData.records[0];
    const existingPassword = user.fields[USUARIOS_HASH_FIELD_ID] || user.fields['Hash'];

    console.log('👤 [API] Datos del usuario encontrado:', {
      id: user.id,
      nombre: (process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? user.fields[process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null) || user.fields['Nombre Completo'] || 'Usuario', // Nombre Completo
      documento: user.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] || user.fields['Numero Documento'],
      hasPassword: !!existingPassword
    });

    // Verificar que sea primer login
    if (existingPassword && existingPassword !== '' && existingPassword !== null) {
      console.log('❌ [API] Usuario ya tiene contraseña configurada');
      return NextResponse.json(
        { error: 'El usuario ya tiene una contraseña configurada' },
        { status: 400 }
      );
    }

    // Generar hash y salt para la nueva contraseña
    const { hash, salt } = hashPassword(newPassword);

    console.log('🔑 [API] Generando credenciales para usuario:', {
      documento: user.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] || user.fields['Numero Documento'],
      nombre: (process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? user.fields[process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null) || user.fields['Nombre Completo'] || 'Usuario',
      hashLength: hash.length,
      saltLength: salt.length
    });

    // Actualizar usuario con nueva contraseña
    const updateResponse = await fetch(`${url}/${user.id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: {
          [USUARIOS_HASH_FIELD_ID]: hash,
          [USUARIOS_SALT_FIELD_ID]: salt
        }
      })
    });

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ [API] Error actualizando usuario:', {
        status: updateResponse.status,
        statusText: updateResponse.statusText,
        error: errorText
      });
      throw new Error(`Error actualizando usuario: ${updateResponse.status} - ${errorText}`);
    }

    console.log('✅ [API] Contraseña configurada exitosamente para:', {
      documento: user.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID],
      nombre: (process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? user.fields[process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null) || user.fields['Nombre Completo'] || 'Usuario'
    });

    // Retornar datos del usuario para login automático
    const userData = {
      id: user.id,
      documento: user.fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID],
      nombre: (process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? user.fields[process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null) || user.fields['Nombre Completo'] || 'Usuario', // Nombre
      email: user.fields.fldeShMh7S9C8kI7Z, // Email
      telefono: user.fields.fldY7qgP1PKAGFm5G, // Telefono
      empresa: user.fields.fldFx3EgzSLJvZMcx, // Empresa
      area: user.fields[USUARIOS_AREA_EMPRESA_FIELD_ID], // Area
      rol: user.fields.fldQ9tBGEhUuRMG9h, // Rol
      tipoUsuario: 'regular'
    };

    return NextResponse.json({
      success: true,
      message: 'Contraseña configurada exitosamente',
      user: userData
    });

  } catch (error) {
    console.error('💥 [API] Error configurando contraseña:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
