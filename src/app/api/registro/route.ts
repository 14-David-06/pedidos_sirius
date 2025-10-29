import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuración de Airtable - Base de Sirius Clientes
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const CONTACTO_USUARIO_TABLE_ID = process.env.CONTACTO_USUARIO_TABLE_ID;

// Field IDs para la tabla de Usuarios
const USUARIO_FIELD_ID = process.env.USUARIO_FIELD_ID;
const TIPO_DOCUMENTO_FIELD_ID = process.env.TIPO_DOCUMENTO_FIELD_ID;
const RUT_FIELD_ID = process.env.RUT_FIELD_ID;
const CAMARA_COMERCIO_FIELD_ID = process.env.CAMARA_COMERCIO_FIELD_ID;

// Field IDs para todas las columnas de Usuarios
const NOMBRE_RAZON_SOCIAL_FIELD_ID = process.env.NOMBRE_RAZON_SOCIAL_FIELD_ID;
const HASH_FIELD_ID = process.env.HASH_FIELD_ID;
const SALT_FIELD_ID = process.env.SALT_FIELD_ID;
const TEMPORAL_TOKEN_FIELD_ID = process.env.TEMPORAL_TOKEN_FIELD_ID;
const DOCUMENTO_FIELD_ID = process.env.DOCUMENTO_FIELD_ID;
const CIUDAD_FIELD_ID = process.env.CIUDAD_FIELD_ID;
const DEPARTAMENTO_FIELD_ID = process.env.DEPARTAMENTO_FIELD_ID;
const DIRECCION_FIELD_ID = process.env.DIRECCION_FIELD_ID;
const CONTRIBUYENTE_FIELD_ID = process.env.CONTRIBUYENTE_FIELD_ID;
const TIPO_CULTIVO_FIELD_ID = process.env.TIPO_CULTIVO_FIELD_ID;

// Field IDs para tabla Contacto_Usuario
const CONTACTO_NOMBRE_FIELD_ID = process.env.CONTACTO_NOMBRE_FIELD_ID;
const CONTACTO_TELEFONO_FIELD_ID = process.env.CONTACTO_TELEFONO_FIELD_ID;
const CONTACTO_EMAIL_FIELD_ID = process.env.CONTACTO_EMAIL_FIELD_ID;
const CONTACTO_AREA_FIELD_ID = process.env.CONTACTO_AREA_FIELD_ID;

// Field IDs para relaciones
const CONTACTO_USUARIO_RELATION_FIELD_ID = process.env.CONTACTO_USUARIO_RELATION_FIELD_ID;

// Configuración AWS S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Función para subir archivo a S3
async function uploadFileToS3(file: File, folder: string): Promise<string> {
  console.log('📁 Iniciando subida a S3:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type,
    folder: folder,
    bucket: process.env.AWS_S3_BUCKET_NAME
  });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${folder}/${Date.now()}-${file.name}`;
  
  console.log('📁 Archivo preparado:', {
    bufferSize: buffer.length,
    s3Key: fileName
  });

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

  console.log('📁 Enviando comando a S3...');
  await s3Client.send(command);
  
  // Retornar URL pública del archivo
  const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
  console.log('📁 Archivo subido exitosamente:', publicUrl);
  return publicUrl;
}

// Función para generar hash de contraseña
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Función para generar salt aleatorio
function generateSalt(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Función para generar token temporal
function generateTemporalToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

export async function POST(request: NextRequest) {
  console.log('🔵 Iniciando registro de usuario...');
  
  try {
    // Manejar FormData del frontend
    console.log('🔵 Procesando FormData...');
    const body = await request.formData();
    const formData: any = {};
    
    // Convertir FormData a objeto
    body.forEach((value, key) => {
      if (value instanceof File) {
        formData[key] = value;
        console.log(`📎 Archivo recibido: ${key} = ${value.name}`);
      } else {
        formData[key] = value;
        console.log(`📝 Campo recibido: ${key} = ${value}`);
      }
    });

    console.log('🔵 FormData procesado:', Object.keys(formData));
    
    // Validaciones básicas
    console.log('🔵 Validando campos obligatorios...');
    if (!formData.nombreRazonSocial || !formData.documento || !formData.password || !formData.usuario) {
      console.log('❌ Faltan campos obligatorios:', {
        nombreRazonSocial: !!formData.nombreRazonSocial,
        documento: !!formData.documento,
        password: !!formData.password,
        usuario: !!formData.usuario
      });
      return NextResponse.json({ 
        error: 'Nombre/Razón Social, documento, usuario y contraseña son campos obligatorios' 
      }, { status: 400 });
    }

    console.log('🔵 Verificando configuración de Airtable...');
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.log('❌ Configuración de Airtable faltante:', {
        hasApiKey: !!AIRTABLE_API_KEY,
        hasBaseId: !!AIRTABLE_BASE_ID
      });
      return NextResponse.json({ 
        error: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    // Verificar si el usuario ya existe (por documento/NIT)
    console.log('🔵 Verificando si el usuario ya existe...');
    const checkUserUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`;
    const searchParams = new URLSearchParams({
      filterByFormula: `{${DOCUMENTO_FIELD_ID}} = "${formData.documento}"`
    });

    console.log('🔵 URL de verificación:', `${checkUserUrl}?${searchParams}`);

    const checkResponse = await fetch(`${checkUserUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('🔵 Respuesta de verificación:', checkResponse.status, checkResponse.statusText);

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.log('❌ Error al verificar usuario:', errorText);
      return NextResponse.json({ 
        error: 'Error al verificar usuario existente' 
      }, { status: 500 });
    }

    const existingUsers = await checkResponse.json();
    console.log('🔵 Usuarios existentes encontrados:', existingUsers.records?.length || 0);
    
    if (existingUsers.records.length > 0) {
      console.log('❌ Usuario ya existe con documento:', formData.documento);
      return NextResponse.json({ 
        error: 'Ya existe un usuario registrado con este documento/NIT' 
      }, { status: 409 });
    }

    // Generar salt y hash para la contraseña
    console.log('🔵 Generando hash de contraseña...');
    const salt = generateSalt();
    const passwordHash = hashPassword(formData.password, salt);
    
    console.log('🔑 Debug contraseña:');
    console.log('   - Salt generado:', salt.length, 'caracteres');
    console.log('   - Hash generado:', passwordHash.length, 'caracteres');
    console.log('   - HASH_FIELD_ID:', HASH_FIELD_ID);
    console.log('   - SALT_FIELD_ID:', SALT_FIELD_ID);

    // Paso 1: Crear el usuario principal en la tabla Usuarios
    console.log('🔵 Preparando datos del usuario...');
    const usuarioData = {
      records: [{
        fields: {} as any
      }]
    };

    // Agregar campos usando variables de entorno
    const fields = usuarioData.records[0].fields;
    
    if (NOMBRE_RAZON_SOCIAL_FIELD_ID) fields[NOMBRE_RAZON_SOCIAL_FIELD_ID] = formData.nombreRazonSocial;
    if (HASH_FIELD_ID) fields[HASH_FIELD_ID] = passwordHash;
    if (SALT_FIELD_ID) fields[SALT_FIELD_ID] = salt;
    if (TEMPORAL_TOKEN_FIELD_ID) fields[TEMPORAL_TOKEN_FIELD_ID] = '';
    if (DOCUMENTO_FIELD_ID) fields[DOCUMENTO_FIELD_ID] = formData.documento;
    if (CIUDAD_FIELD_ID) fields[CIUDAD_FIELD_ID] = formData.ciudad;
    if (DEPARTAMENTO_FIELD_ID) fields[DEPARTAMENTO_FIELD_ID] = formData.departamento;
    if (DIRECCION_FIELD_ID) fields[DIRECCION_FIELD_ID] = formData.direccion;
    if (CONTRIBUYENTE_FIELD_ID) fields[CONTRIBUYENTE_FIELD_ID] = formData.contribuyente;
    if (TIPO_CULTIVO_FIELD_ID) fields[TIPO_CULTIVO_FIELD_ID] = formData.tipoCultivo === 'Otro' ? formData.tipoCultivoOtro : formData.tipoCultivo;
    if (USUARIO_FIELD_ID) fields[USUARIO_FIELD_ID] = formData.usuario;
    if (TIPO_DOCUMENTO_FIELD_ID) fields[TIPO_DOCUMENTO_FIELD_ID] = formData.tipoDocumento;

    // Manejo de archivos - Subida a AWS S3
    console.log('📎 Verificando archivos recibidos:', {
      rutFile: !!formData.rutFile,
      camaraComercioFile: !!formData.camaraComercioFile,
      RUT_FIELD_ID: RUT_FIELD_ID,
      CAMARA_COMERCIO_FIELD_ID: CAMARA_COMERCIO_FIELD_ID
    });

    if (formData.rutFile && RUT_FIELD_ID) {
      console.log('🔵 Subiendo archivo RUT a S3...');
      try {
        const rutUrl = await uploadFileToS3(formData.rutFile, 'rut-files');
        fields[RUT_FIELD_ID] = [{
          filename: formData.rutFile.name,
          url: rutUrl
        }];
        console.log('✅ Archivo RUT subido exitosamente y agregado a campos:', {
          fieldId: RUT_FIELD_ID,
          filename: formData.rutFile.name,
          url: rutUrl
        });
      } catch (error) {
        console.error('❌ Error subiendo archivo RUT:', error);
        // Continuamos sin el archivo si hay error
      }
    } else {
      console.log('⚠️ Archivo RUT no procesado:', {
        hasFile: !!formData.rutFile,
        hasFieldId: !!RUT_FIELD_ID
      });
    }

    if (formData.camaraComercioFile && CAMARA_COMERCIO_FIELD_ID) {
      console.log('🔵 Subiendo archivo Cámara de Comercio a S3...');
      try {
        const camaraUrl = await uploadFileToS3(formData.camaraComercioFile, 'camara-comercio-files');
        fields[CAMARA_COMERCIO_FIELD_ID] = [{
          filename: formData.camaraComercioFile.name,
          url: camaraUrl
        }];
        console.log('✅ Archivo Cámara de Comercio subido exitosamente y agregado a campos:', {
          fieldId: CAMARA_COMERCIO_FIELD_ID,
          filename: formData.camaraComercioFile.name,
          url: camaraUrl
        });
      } catch (error) {
        console.error('❌ Error subiendo archivo Cámara de Comercio:', error);
        // Continuamos sin el archivo si hay error
      }
    } else {
      console.log('⚠️ Archivo Cámara de Comercio no procesado:', {
        hasFile: !!formData.camaraComercioFile,
        hasFieldId: !!CAMARA_COMERCIO_FIELD_ID
      });
    }

    console.log('🔵 Datos del usuario a crear:', {
      nombreRazonSocial: formData.nombreRazonSocial,
      usuario: formData.usuario,
      documento: formData.documento,
      ciudad: formData.ciudad,
      departamento: formData.departamento,
      contribuyente: formData.contribuyente
    });

    console.log('📋 Campos finales a enviar a Airtable:', {
      totalFields: Object.keys(fields).length,
      fieldKeys: Object.keys(fields),
      hasRutField: !!fields[RUT_FIELD_ID!],
      hasCamaraField: !!fields[CAMARA_COMERCIO_FIELD_ID!],
      rutValue: fields[RUT_FIELD_ID!],
      camaraValue: fields[CAMARA_COMERCIO_FIELD_ID!]
    });

    console.log('🔵 Creando usuario en Airtable...');
    const createUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData)
    });

    console.log('🔵 Respuesta de creación de usuario:', createUserResponse.status, createUserResponse.statusText);

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.text();
      console.error('❌ Error creating user:', errorData);
      return NextResponse.json({ 
        error: 'Error al crear el usuario principal' 
      }, { status: 500 });
    }

    const createdUser = await createUserResponse.json();
    console.log('✅ Usuario creado exitosamente:', createdUser.records[0].id);
    const userId = createdUser.records[0].id;

    // Paso 2: Crear los contactos asociados
    console.log('🔵 Preparando contactos...');
    const contactos = [];

    // Contacto Contable
    if (formData.nombreContable && formData.telefonoContable && formData.emailContable) {
      console.log('🔵 Agregando contacto contable...');
      const contactoFields: any = {};
      
      if (CONTACTO_NOMBRE_FIELD_ID) contactoFields[CONTACTO_NOMBRE_FIELD_ID] = formData.nombreContable;
      if (CONTACTO_TELEFONO_FIELD_ID) contactoFields[CONTACTO_TELEFONO_FIELD_ID] = formData.telefonoContable;
      if (CONTACTO_EMAIL_FIELD_ID) contactoFields[CONTACTO_EMAIL_FIELD_ID] = formData.emailContable;
      if (CONTACTO_AREA_FIELD_ID) contactoFields[CONTACTO_AREA_FIELD_ID] = 'Contable';
      if (CONTACTO_USUARIO_RELATION_FIELD_ID) contactoFields[CONTACTO_USUARIO_RELATION_FIELD_ID] = [userId];
      
      contactos.push({ fields: contactoFields });
    }

    // Contacto Tesorería
    if (formData.nombreTesoreria && formData.telefonoTesoreria && formData.emailTesoreria) {
      console.log('🔵 Agregando contacto tesorería...');
      const contactoFields: any = {};
      
      if (CONTACTO_NOMBRE_FIELD_ID) contactoFields[CONTACTO_NOMBRE_FIELD_ID] = formData.nombreTesoreria;
      if (CONTACTO_TELEFONO_FIELD_ID) contactoFields[CONTACTO_TELEFONO_FIELD_ID] = formData.telefonoTesoreria;
      if (CONTACTO_EMAIL_FIELD_ID) contactoFields[CONTACTO_EMAIL_FIELD_ID] = formData.emailTesoreria;
      if (CONTACTO_AREA_FIELD_ID) contactoFields[CONTACTO_AREA_FIELD_ID] = 'Tesoria';
      if (CONTACTO_USUARIO_RELATION_FIELD_ID) contactoFields[CONTACTO_USUARIO_RELATION_FIELD_ID] = [userId];
      
      contactos.push({ fields: contactoFields });
    }

    // Contacto Compras
    if (formData.nombreCompras && formData.telefonoCompras && formData.emailCompras) {
      console.log('🔵 Agregando contacto compras...');
      const contactoFields: any = {};
      
      if (CONTACTO_NOMBRE_FIELD_ID) contactoFields[CONTACTO_NOMBRE_FIELD_ID] = formData.nombreCompras;
      if (CONTACTO_TELEFONO_FIELD_ID) contactoFields[CONTACTO_TELEFONO_FIELD_ID] = formData.telefonoCompras;
      if (CONTACTO_EMAIL_FIELD_ID) contactoFields[CONTACTO_EMAIL_FIELD_ID] = formData.emailCompras;
      if (CONTACTO_AREA_FIELD_ID) contactoFields[CONTACTO_AREA_FIELD_ID] = 'Compras';
      if (CONTACTO_USUARIO_RELATION_FIELD_ID) contactoFields[CONTACTO_USUARIO_RELATION_FIELD_ID] = [userId];
      
      contactos.push({ fields: contactoFields });
    }

    console.log('🔵 Total de contactos a crear:', contactos.length);

    // Debug de relaciones
    console.log('🔗 Debug de relaciones:', {
      CONTACTO_USUARIO_RELATION_FIELD_ID: CONTACTO_USUARIO_RELATION_FIELD_ID,
      userId: userId,
      hasRelationField: !!CONTACTO_USUARIO_RELATION_FIELD_ID,
      contactosConRelacion: contactos.map(c => !!c.fields[CONTACTO_USUARIO_RELATION_FIELD_ID!])
    });

    // Crear los contactos si hay alguno
    let contactosCreados = [];
    if (contactos.length > 0) {
      console.log('🔵 Creando contactos en Airtable...');
      const contactosData = {
        records: contactos
      };

      const createContactsResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CONTACTO_USUARIO_TABLE_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactosData)
      });

      console.log('🔵 Respuesta de creación de contactos:', createContactsResponse.status, createContactsResponse.statusText);

      if (createContactsResponse.ok) {
        const contactsResult = await createContactsResponse.json();
        contactosCreados = contactsResult.records;
        console.log('✅ Contactos creados exitosamente:', contactosCreados.length);
      } else {
        const errorText = await createContactsResponse.text();
        console.error('❌ Error creating contacts:', errorText);
        console.error('Error creating contacts, but user was created successfully');
        // No fallar completamente si los contactos no se crean
      }
    } else {
      console.log('⚠️ No hay contactos para crear');
    }

    // Respuesta exitosa
    console.log('✅ Registro completado exitosamente');
    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      usuario: {
        id: userId,
        nombre: formData.nombreRazonSocial,
        documento: formData.documento
      },
      contactos: contactosCreados.map((contacto: any) => ({
        id: contacto.id,
        nombre: contacto.fields[CONTACTO_NOMBRE_FIELD_ID || ''], // Nombre
        area: contacto.fields[CONTACTO_AREA_FIELD_ID || ''] // Area
      }))
    });

  } catch (error) {
    console.error('❌ Error general en registro:', error);
    console.error('❌ Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
