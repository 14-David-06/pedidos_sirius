import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configuración de Airtable - Base de Sirius Clientes
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas
const CLIENTES_TABLE_ID = process.env.CLIENTES_TABLE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const CONTACTO_USUARIO_TABLE_ID = process.env.CONTACTO_USUARIO_TABLE_ID;

// Field IDs para la tabla de Clientes (datos de la empresa)
const CLIENTES_NOMBRE_RAZON_SOCIAL_FIELD_ID = process.env.CLIENTES_NOMBRE_RAZON_SOCIAL_FIELD_ID;
const CLIENTES_TIPO_DOCUMENTO_FIELD_ID = process.env.CLIENTES_TIPO_DOCUMENTO_FIELD_ID;
const CLIENTES_NUMERO_DOCUMENTO_FIELD_ID = process.env.CLIENTES_NUMERO_DOCUMENTO_FIELD_ID;
const CLIENTES_CIUDAD_FIELD_ID = process.env.CLIENTES_CIUDAD_FIELD_ID;
const CLIENTES_DEPARTAMENTO_FIELD_ID = process.env.CLIENTES_DEPARTAMENTO_FIELD_ID;
const CLIENTES_DIRECCION_FIELD_ID = process.env.CLIENTES_DIRECCION_FIELD_ID;
const CLIENTES_CONTRIBUYENTE_FIELD_ID = process.env.CLIENTES_CONTRIBUYENTE_FIELD_ID;
const CLIENTES_TIPO_CULTIVO_FIELD_ID = process.env.CLIENTES_TIPO_CULTIVO_FIELD_ID;
const CLIENTES_RUT_FIELD_ID = process.env.CLIENTES_RUT_FIELD_ID;
const CLIENTES_CAMARA_COMERCIO_FIELD_ID = process.env.CLIENTES_CAMARA_COMERCIO_FIELD_ID;

// Field IDs para la tabla de Usuarios (credenciales)
const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID;
const USUARIOS_TIPO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_TIPO_DOCUMENTO_FIELD_ID;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
const USUARIOS_HASH_FIELD_ID = process.env.USUARIOS_HASH_FIELD_ID;
const USUARIOS_SALT_FIELD_ID = process.env.USUARIOS_SALT_FIELD_ID;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID;
const USUARIOS_ROL_USUARIO_FIELD_ID = process.env.USUARIOS_ROL_USUARIO_FIELD_ID;
const USUARIOS_ENTIDAD_FIELD_ID = process.env.USUARIOS_ENTIDAD_FIELD_ID;

// Field IDs para tabla Contacto_Usuario
const CONTACTO_NOMBRE_FIELD_ID = process.env.CONTACTO_NOMBRE_FIELD_ID;
const CONTACTO_TELEFONO_FIELD_ID = process.env.CONTACTO_TELEFONO_FIELD_ID;
const CONTACTO_EMAIL_FIELD_ID = process.env.CONTACTO_EMAIL_FIELD_ID;
const CONTACTO_AREA_FIELD_ID = process.env.CONTACTO_AREA_FIELD_ID;
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
  
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: file.type,
  });

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



export async function POST(request: NextRequest) {
  console.log('🔵 Iniciando registro de Cliente y Usuario...');
  
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
    if (!formData.nombreRazonSocial || !formData.documento || !formData.password || 
        !formData.nombreCompleto || !formData.numeroDocumentoUsuario || !formData.areaEmpresa) {
      console.log('❌ Faltan campos obligatorios:', {
        nombreRazonSocial: !!formData.nombreRazonSocial,
        documento: !!formData.documento,
        password: !!formData.password,
        nombreCompleto: !!formData.nombreCompleto,
        numeroDocumentoUsuario: !!formData.numeroDocumentoUsuario,
        areaEmpresa: !!formData.areaEmpresa
      });
      return NextResponse.json({ 
        error: 'Nombre/Razón Social, documento, contraseña, nombre completo, número de documento del usuario y área de empresa son campos obligatorios' 
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

    // Verificar configuración de tablas y campos requeridos
    console.log('🔵 Verificando configuración de tablas y campos...');
    const requiredEnvVars = {
      CLIENTES_TABLE_ID,
      USUARIOS_TABLE_ID,
      CLIENTES_NOMBRE_RAZON_SOCIAL_FIELD_ID,
      CLIENTES_TIPO_DOCUMENTO_FIELD_ID,
      CLIENTES_NUMERO_DOCUMENTO_FIELD_ID,
      USUARIOS_NOMBRE_COMPLETO_FIELD_ID,
      USUARIOS_TIPO_DOCUMENTO_FIELD_ID,
      USUARIOS_NUMERO_DOCUMENTO_FIELD_ID,
      USUARIOS_HASH_FIELD_ID,
      USUARIOS_SALT_FIELD_ID,
      USUARIOS_AREA_EMPRESA_FIELD_ID,
      USUARIOS_ROL_USUARIO_FIELD_ID,
      USUARIOS_ENTIDAD_FIELD_ID
    };

    const missingVars = Object.entries(requiredEnvVars)
      .filter(([key, value]) => !value)
      .map(([key]) => key);

    if (missingVars.length > 0) {
      console.log('❌ Variables de entorno faltantes:', missingVars);
      return NextResponse.json({ 
        error: 'Error de configuración del servidor - variables faltantes: ' + missingVars.join(', ')
      }, { status: 500 });
    }

    // Verificar si el cliente ya existe (por documento/NIT)
    console.log('🔵 Verificando si el cliente ya existe...');
    const checkClientUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTES_TABLE_ID}`;
    const searchParams = new URLSearchParams({
      filterByFormula: `{${CLIENTES_NUMERO_DOCUMENTO_FIELD_ID}} = "${formData.documento}"`
    });

    console.log('🔵 URL de verificación:', `${checkClientUrl}?${searchParams}`);

    const checkResponse = await fetch(`${checkClientUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('🔵 Respuesta de verificación:', checkResponse.status, checkResponse.statusText);

    if (!checkResponse.ok) {
      const errorText = await checkResponse.text();
      console.log('❌ Error al verificar cliente:', errorText);
      return NextResponse.json({ 
        error: 'Error al verificar cliente existente' 
      }, { status: 500 });
    }

    const existingClients = await checkResponse.json();
    console.log('🔵 Clientes existentes encontrados:', existingClients.records?.length || 0);
    
    if (existingClients.records.length > 0) {
      console.log('❌ Cliente ya existe con documento:', formData.documento);
      return NextResponse.json({ 
        error: 'Ya existe un cliente registrado con este documento/NIT' 
      }, { status: 409 });
    }

    // Generar salt y hash para la contraseña
    console.log('🔵 Generando hash de contraseña...');
    const salt = generateSalt();
    const passwordHash = hashPassword(formData.password, salt);
    
    console.log('🔑 Debug contraseña:');
    console.log('   - Salt generado:', salt.length, 'caracteres');
    console.log('   - Hash generado:', passwordHash.length, 'caracteres');

    // PASO 1: Crear el cliente en la tabla Clientes
    console.log('🔵 Preparando datos del Cliente...');
    const clienteData = {
      records: [{
        fields: {} as any
      }]
    };

    // Agregar campos del cliente
    const clienteFields = clienteData.records[0].fields;
    
    clienteFields[CLIENTES_NOMBRE_RAZON_SOCIAL_FIELD_ID!] = formData.nombreRazonSocial;
    clienteFields[CLIENTES_TIPO_DOCUMENTO_FIELD_ID!] = formData.tipoDocumento;
    clienteFields[CLIENTES_NUMERO_DOCUMENTO_FIELD_ID!] = formData.documento;
    if (formData.ciudad && CLIENTES_CIUDAD_FIELD_ID) clienteFields[CLIENTES_CIUDAD_FIELD_ID] = formData.ciudad;
    if (formData.departamento && CLIENTES_DEPARTAMENTO_FIELD_ID) clienteFields[CLIENTES_DEPARTAMENTO_FIELD_ID] = formData.departamento;
    if (formData.direccion && CLIENTES_DIRECCION_FIELD_ID) clienteFields[CLIENTES_DIRECCION_FIELD_ID] = formData.direccion;
    if (formData.contribuyente && CLIENTES_CONTRIBUYENTE_FIELD_ID) clienteFields[CLIENTES_CONTRIBUYENTE_FIELD_ID] = formData.contribuyente;
    if (formData.tipoCultivo === 'Otro' && CLIENTES_TIPO_CULTIVO_FIELD_ID) {
      clienteFields[CLIENTES_TIPO_CULTIVO_FIELD_ID] = formData.tipoCultivoOtro;
    } else if (formData.tipoCultivo && CLIENTES_TIPO_CULTIVO_FIELD_ID) {
      clienteFields[CLIENTES_TIPO_CULTIVO_FIELD_ID] = formData.tipoCultivo;
    }

    // Manejo de archivos - Subida a AWS S3
    console.log('📎 Verificando archivos recibidos:', {
      rutFile: !!formData.rutFile,
      camaraComercioFile: !!formData.camaraComercioFile
    });

    if (formData.rutFile) {
      console.log('🔵 Subiendo archivo RUT a S3...');
      try {
        const rutUrl = await uploadFileToS3(formData.rutFile, 'rut-files');
        if (CLIENTES_RUT_FIELD_ID) {
          clienteFields[CLIENTES_RUT_FIELD_ID] = [{
            filename: formData.rutFile.name,
            url: rutUrl
          }];
        }
        console.log('✅ Archivo RUT subido exitosamente');
      } catch (error) {
        console.error('❌ Error subiendo archivo RUT:', error);
        // Continuamos sin el archivo si hay error
      }
    }

    if (formData.camaraComercioFile) {
      console.log('🔵 Subiendo archivo Cámara de Comercio a S3...');
      try {
        const camaraUrl = await uploadFileToS3(formData.camaraComercioFile, 'camara-comercio-files');
        if (CLIENTES_CAMARA_COMERCIO_FIELD_ID) {
          clienteFields[CLIENTES_CAMARA_COMERCIO_FIELD_ID] = [{
            filename: formData.camaraComercioFile.name,
            url: camaraUrl
          }];
        }
        console.log('✅ Archivo Cámara de Comercio subido exitosamente');
      } catch (error) {
        console.error('❌ Error subiendo archivo Cámara de Comercio:', error);
        // Continuamos sin el archivo si hay error
      }
    }

    console.log('🔵 Creando Cliente en Airtable...');
    const createClientResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTES_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clienteData)
    });

    console.log('🔵 Respuesta de creación de Cliente:', createClientResponse.status, createClientResponse.statusText);

    if (!createClientResponse.ok) {
      const errorData = await createClientResponse.text();
      console.error('❌ Error creating client:', errorData);
      return NextResponse.json({ 
        error: 'Error al crear el cliente' 
      }, { status: 500 });
    }

    const createdClient = await createClientResponse.json();
    console.log('✅ Cliente creado exitosamente:', createdClient.records[0].id);
    const clienteId = createdClient.records[0].id;

    // PASO 2: Crear el usuario en la tabla Usuarios
    console.log('🔵 Preparando datos del Usuario...');
    const usuarioData = {
      records: [{
        fields: {} as any
      }]
    };

    // Agregar campos del usuario
    const usuarioFields = usuarioData.records[0].fields;
    
    usuarioFields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID!] = formData.nombreCompleto;
    if (USUARIOS_TIPO_DOCUMENTO_FIELD_ID) usuarioFields[USUARIOS_TIPO_DOCUMENTO_FIELD_ID] = formData.tipoDocumentoUsuario;
    if (USUARIOS_NUMERO_DOCUMENTO_FIELD_ID) usuarioFields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] = formData.numeroDocumentoUsuario;
    usuarioFields[USUARIOS_HASH_FIELD_ID!] = passwordHash;
    usuarioFields[USUARIOS_SALT_FIELD_ID!] = salt;
    if (USUARIOS_AREA_EMPRESA_FIELD_ID) usuarioFields[USUARIOS_AREA_EMPRESA_FIELD_ID] = formData.areaEmpresa;
    usuarioFields[USUARIOS_ROL_USUARIO_FIELD_ID!] = 'Usuario Raiz';
    usuarioFields[USUARIOS_ENTIDAD_FIELD_ID!] = [clienteId]; // Relación con el cliente

    console.log('🔵 Creando Usuario en Airtable...');
    const createUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData)
    });

    console.log('🔵 Respuesta de creación de Usuario:', createUserResponse.status, createUserResponse.statusText);

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.text();
      console.error('❌ Error creating user:', errorData);
      return NextResponse.json({ 
        error: 'Error al crear el usuario' 
      }, { status: 500 });
    }

    const createdUser = await createUserResponse.json();
    console.log('✅ Usuario creado exitosamente:', createdUser.records[0].id);
    const userId = createdUser.records[0].id;

    // PASO 3: Crear los contactos asociados al cliente
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
      if (CONTACTO_USUARIO_RELATION_FIELD_ID) contactoFields[CONTACTO_USUARIO_RELATION_FIELD_ID] = [clienteId];
      
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
      if (CONTACTO_USUARIO_RELATION_FIELD_ID) contactoFields[CONTACTO_USUARIO_RELATION_FIELD_ID] = [clienteId];
      
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
      if (CONTACTO_USUARIO_RELATION_FIELD_ID) contactoFields[CONTACTO_USUARIO_RELATION_FIELD_ID] = [clienteId];
      
      contactos.push({ fields: contactoFields });
    }

    console.log('🔵 Total de contactos a crear:', contactos.length);

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
        console.error('Error creating contacts, but client and user were created successfully');
        // No fallar completamente si los contactos no se crean
      }
    } else {
      console.log('⚠️ No hay contactos para crear');
    }

    // Respuesta exitosa
    console.log('✅ Registro de Cliente y Usuario completado exitosamente');
    return NextResponse.json({
      success: true,
      message: 'Cliente y Usuario registrados exitosamente',
      cliente: {
        id: clienteId,
        nombre: formData.nombreRazonSocial,
        documento: formData.documento
      },
      usuario: {
        id: userId,
        nombre: formData.usuario,
        documento: formData.documento,
        tipoUsuario: 'raiz'
      },
      contactos: contactosCreados.map((contacto: any) => ({
        id: contacto.id,
        nombre: contacto.fields[CONTACTO_NOMBRE_FIELD_ID || ''],
        area: contacto.fields[CONTACTO_AREA_FIELD_ID || '']
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
