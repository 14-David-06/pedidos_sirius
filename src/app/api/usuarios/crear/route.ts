import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;

// Field IDs de la tabla USUARIOS
const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID;
const USUARIOS_TIPO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_TIPO_DOCUMENTO_FIELD_ID;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID;
const USUARIOS_ROL_USUARIO_FIELD_ID = process.env.USUARIOS_ROL_USUARIO_FIELD_ID;
const USUARIOS_ENTIDAD_FIELD_ID = process.env.USUARIOS_ENTIDAD_FIELD_ID;

// Field ID para trazabilidad - quién modificó por última vez
const USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID = process.env.USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID;

export async function POST(request: NextRequest) {
  console.log('👤 Iniciando creación de usuario regular...');
  
  // Validar que todas las variables de entorno requeridas estén configuradas
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USUARIOS_TABLE_ID ||
      !USUARIOS_NOMBRE_COMPLETO_FIELD_ID || !USUARIOS_TIPO_DOCUMENTO_FIELD_ID ||
      !USUARIOS_NUMERO_DOCUMENTO_FIELD_ID || !USUARIOS_AREA_EMPRESA_FIELD_ID ||
      !USUARIOS_ROL_USUARIO_FIELD_ID || !USUARIOS_ENTIDAD_FIELD_ID ||
      !USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID) {
    console.error('❌ Error de configuración: faltan variables de entorno requeridas');
    return NextResponse.json({ 
      error: 'Error de configuración del servidor' 
    }, { status: 500 });
  }
  
  try {
    const userRootId = request.headers.get('X-User-Root-Id');
    
    if (!userRootId) {
      return NextResponse.json({ 
        error: 'No se pudo identificar el usuario raíz' 
      }, { status: 401 });
    }

    // Primero, determinar si es un usuario raíz o admin y obtener sus datos
    console.log('🔍 Buscando datos del usuario:', userRootId);
    
    let userData = null;
    let userType = '';
    let creadorNombre = '';
    let entidadIdValue = '';
    
    // PRIMERO: Buscar como usuario raíz
    console.log('🔍 Buscando como usuario raíz...');
    try {
      const rootUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${process.env.USUARIOS_RAIZ_TABLE_ID}/${userRootId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (rootUserResponse.ok) {
        const rootUserData = await rootUserResponse.json();
        
        if (rootUserData && rootUserData.id === userRootId && rootUserData.fields) {
          userData = rootUserData;
          userType = 'raiz';
          
          // Para usuario raíz: él ES la entidad
          entidadIdValue = userRootId;
          
          // Obtener nombre del usuario raíz
          creadorNombre = userData.fields['Nombre o Razón Social'] || 
                         userData.fields['Nombre Razon Social'] || 
                         userData.fields['Usuario'] ||
                         'Usuario Raíz';
                         
          console.log('✅ Usuario raíz encontrado:', {
            id: userData.id,
            nombre: creadorNombre,
            esEntidad: entidadIdValue
          });
        }
      }
    } catch (error) {
      console.log('⚠️ Error buscando en tabla raíz:', error instanceof Error ? error.message : 'Error desconocido');
    }

    // SEGUNDO: Si no se encontró como raíz, buscar como usuario admin
    if (!userData) {
      console.log('🔍 Buscando como usuario admin...');
      try {
        const adminUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userRootId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (adminUserResponse.ok) {
          const adminUserData = await adminUserResponse.json();
          
          if (adminUserData && adminUserData.id === userRootId && adminUserData.fields) {
            userData = adminUserData;
            
            // Verificar que el usuario tenga rol Admin
            const userRole = userData.fields[USUARIOS_ROL_USUARIO_FIELD_ID!] || userData.fields['Rol Usuario'];
            
            if (userRole !== 'Admin') {
              return NextResponse.json({ 
                error: 'Solo usuarios raíz y usuarios con rol Admin pueden crear otros usuarios' 
              }, { status: 403 });
            }
            
            userType = 'admin';
            
            // Para usuario admin: debe tener entidad asignada
            const adminEntidad = userData.fields[USUARIOS_ENTIDAD_FIELD_ID!] || userData.fields['Entidad'];
            
            if (!adminEntidad || !Array.isArray(adminEntidad) || adminEntidad.length === 0) {
              console.error('❌ Usuario admin no tiene entidad asignada:', userData.fields);
              return NextResponse.json({ 
                error: 'El usuario administrador no tiene entidad asignada' 
              }, { status: 400 });
            }

            entidadIdValue = adminEntidad[0];
            
            // Obtener nombre del usuario admin
            creadorNombre = userData.fields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID!] || 
                           userData.fields['Nombre Completo'] || 
                           userData.fields['Usuario'] ||
                           'Usuario Admin';
                           
            console.log('✅ Usuario admin encontrado:', {
              id: userData.id,
              nombre: creadorNombre,
              entidad: entidadIdValue
            });
          }
        }
      } catch (error) {
        console.log('⚠️ Error buscando en tabla usuarios:', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
    
    // PRIMERO: Buscar como usuario raíz en la tabla raíz
    console.log('🔍 Buscando como usuario raíz...');
    try {
      const rootUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${process.env.USUARIOS_RAIZ_TABLE_ID}/${userRootId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Respuesta de tabla raíz:', {
        status: rootUserResponse.status,
        ok: rootUserResponse.ok,
        statusText: rootUserResponse.statusText
      });

      // IMPORTANTE: SOLO considerar status 200 como encontrado válido
      // Status 404 = no existe, cualquier otro status es un error
      if (rootUserResponse.status === 200) {
        const rootUserData = await rootUserResponse.json();
        console.log('🔍 Datos de tabla raíz:', {
          hasId: !!rootUserData?.id,
          hasFields: !!rootUserData?.fields,
          id: rootUserData?.id,
          fieldsKeys: rootUserData?.fields ? Object.keys(rootUserData.fields) : []
        });
        
        // Verificación ESTRICTA: el ID debe coincidir exactamente
        if (rootUserData && rootUserData.id === userRootId && rootUserData.fields && Object.keys(rootUserData.fields).length > 0) {
          console.log('⚠️ PROBLEMA DETECTADO: Usuario encontrado en tabla que creemos es raíz');
          console.log('⚠️ Pero Airtable dice que este ID pertenece a tblZmDsMCRDUWBaAQ');
          console.log('⚠️ Y que el campo enlaza con tblYlKMm5yTQgLdjx');
          console.log('⚠️ Esto sugiere que los IDs de tabla están intercambiados en .env.local');
          
          // NO asignar userData aquí para forzar la búsqueda en tabla usuarios
        } else {
          console.log('⚠️ Datos de tabla raíz no válidos o ID no coincide exactamente');
        }
      } else if (rootUserResponse.status === 404) {
        console.log('⚠️ Usuario NO existe en tabla raíz (404 - esto es normal)');
      } else {
        console.log('⚠️ Error inesperado en tabla raíz:', rootUserResponse.status, rootUserResponse.statusText);
      }
    } catch (error) {
      console.log('⚠️ Error buscando en tabla raíz:', error instanceof Error ? error.message : 'Error desconocido');
    }

    // SEGUNDO: Si no se encontró como raíz, buscar como usuario admin/regular
    if (!userData) {
      console.log('🔍 Buscando como usuario admin/regular...');
      try {
        const adminUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userRootId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('🔍 Respuesta de tabla usuarios:', {
          status: adminUserResponse.status,
          ok: adminUserResponse.ok,
          statusText: adminUserResponse.statusText
        });

        // IMPORTANTE: Solo considerar 404 como "no encontrado", cualquier otro status es un error real
        if (adminUserResponse.status === 404) {
          console.log('⚠️ Usuario NO existe en tabla usuarios (404)');
        } else if (adminUserResponse.ok) {
          const adminUserData = await adminUserResponse.json();
          console.log('🔍 Datos de tabla usuarios:', {
            hasId: !!adminUserData?.id,
            hasFields: !!adminUserData?.fields,
            id: adminUserData?.id,
            fieldsKeys: adminUserData?.fields ? Object.keys(adminUserData.fields) : []
          });
          
          // Verificar que realmente se encontró el usuario Y que coincide el ID EXACTAMENTE
          if (adminUserData && adminUserData.id === userRootId && adminUserData.fields && Object.keys(adminUserData.fields).length > 0) {
            userData = adminUserData;
            
            // Verificar que el usuario tenga rol Admin
            const userRole = userData.fields[USUARIOS_ROL_USUARIO_FIELD_ID!] || userData.fields['Rol Usuario'];
            
            console.log('👤 Usuario regular encontrado y verificado:', {
              id: userData.id,
              rol: userRole,
              fields: Object.keys(userData.fields)
            });
            
            // AQUÍ ESTÁ EL PROBLEMA: Este usuario parece ser admin pero está en la tabla que creemos es usuarios
            // Sin embargo, Airtable dice que está en tblZmDsMCRDUWBaAQ (usuarios) y el campo enlaza con tblYlKMm5yTQgLdjx (raíz)
            // Esto significa que NUESTRO .env.local tiene los IDs intercambiados
            
            console.log('🔍 ANÁLISIS DEL PROBLEMA:');
            console.log('   - Este usuario está en tabla que llamamos USUARIOS_TABLE_ID');
            console.log('   - Pero el campo Entidad enlaza con tabla USUARIOS_RAIZ_TABLE_ID');
            console.log('   - Los IDs de tabla están intercambiados en nuestro .env.local');
            
            if (userRole !== 'Admin') {
              return NextResponse.json({ 
                error: 'Solo usuarios raíz y usuarios con rol Admin pueden crear otros usuarios' 
              }, { status: 403 });
            }
            
            userType = 'admin';
            
            // SOLUCIÓN TEMPORAL: Como el campo Entidad enlaza con tblYlKMm5yTQgLdjx,
            // y sabemos que en nuestro .env.local eso es USUARIOS_RAIZ_TABLE_ID,
            // necesitamos buscar un usuario raíz REAL en esa tabla para usar como entidad
            
            // Para usuario admin: debe tener entidad asignada PERO como los IDs están intercambiados,
            // necesitamos buscar la entidad en la tabla correcta
            const adminEntidad = userData.fields[USUARIOS_ENTIDAD_FIELD_ID!] || userData.fields['Entidad'];
            
            if (!adminEntidad || !Array.isArray(adminEntidad) || adminEntidad.length === 0) {
              console.error('❌ Usuario admin no tiene entidad asignada:', userData.fields);
              return NextResponse.json({ 
                error: 'El usuario administrador no tiene entidad asignada' 
              }, { status: 400 });
            }

            entidadIdValue = adminEntidad[0];
            
            console.log('🔍 PROBLEMA: Entidad encontrada es:', entidadIdValue);
            console.log('🔍 Pero necesitamos una entidad que esté en la tabla correcta');
            console.log('🔍 Según el error, necesitamos un ID de tblYlKMm5yTQgLdjx');
            console.log('🔍 En nuestro .env.local eso es:', process.env.USUARIOS_RAIZ_TABLE_ID);
            
            // Obtener nombre del usuario admin
            creadorNombre = userData.fields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID!] || 
                           userData.fields['Nombre Completo'] || 
                           userData.fields['Usuario'] ||
                           'Usuario Admin';
                           
            console.log('✅ Usuario admin encontrado:', {
              id: userData.id,
              nombre: creadorNombre,
              entidad: entidadIdValue
            });
          } else {
            console.log('⚠️ Datos de tabla usuarios no válidos o ID no coincide exactamente');
          }
        } else {
          console.log('⚠️ Error inesperado en tabla usuarios:', adminUserResponse.status, adminUserResponse.statusText);
        }
      } catch (error) {
        console.log('⚠️ Error buscando en tabla usuarios:', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
    
    console.log('👤 Usuario que está creando:', creadorNombre);
    console.log('🏢 Entidad asignada:', entidadIdValue);
    console.log('🔍 Tipo de usuario detectado:', userType);
    
    // Verificar que se haya encontrado y configurado el usuario correctamente
    if (!userData || !userType || !entidadIdValue) {
      console.error('❌ Error: No se pudo determinar el tipo de usuario o entidad');
      return NextResponse.json({ 
        error: 'No se pudo verificar el tipo de usuario o determinar la entidad' 
      }, { status: 400 });
    }

    const {
      nombreCompleto,
      tipoDocumento,
      numeroDocumento,
      areaEmpresa,
      rolUsuario
    } = await request.json();

    // Validar campos requeridos
    if (!nombreCompleto || !numeroDocumento || !areaEmpresa || !rolUsuario) {
      return NextResponse.json({ 
        error: 'Todos los campos son requeridos' 
      }, { status: 400 });
    }

    console.log('👤 Datos del nuevo usuario:');
    console.log('   - Nombre:', nombreCompleto);
    console.log('   - Documento:', tipoDocumento, numeroDocumento);
    console.log('   - Área:', areaEmpresa);
    console.log('   - Rol:', rolUsuario);
    console.log('   - Empresa ID:', userRootId);

    // Verificar si ya existe un usuario con el mismo documento
    const checkDocResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}?filterByFormula={${USUARIOS_NUMERO_DOCUMENTO_FIELD_ID}}="${numeroDocumento}"`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (checkDocResponse.ok) {
      const existingDocs = await checkDocResponse.json();
      if (existingDocs.records && existingDocs.records.length > 0) {
        return NextResponse.json({ 
          error: 'Ya existe un usuario con ese número de documento' 
        }, { status: 400 });
      }
    }

    console.log('👤 Creando usuario sin credenciales de acceso (usará documento para login)');

    // Preparar datos para crear el usuario
    const createData = {
      records: [{
        fields: {} as any
      }]
    };

    const fields = createData.records[0].fields;

    // Asignar todos los campos disponibles
    if (USUARIOS_NOMBRE_COMPLETO_FIELD_ID) {
      fields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID] = nombreCompleto;
    }
    
    if (USUARIOS_TIPO_DOCUMENTO_FIELD_ID) {
      fields[USUARIOS_TIPO_DOCUMENTO_FIELD_ID] = tipoDocumento;
    }
    
    if (USUARIOS_NUMERO_DOCUMENTO_FIELD_ID) {
      fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] = numeroDocumento;
    }
    
    if (USUARIOS_AREA_EMPRESA_FIELD_ID) {
      fields[USUARIOS_AREA_EMPRESA_FIELD_ID] = areaEmpresa;
    }
    
    if (USUARIOS_ROL_USUARIO_FIELD_ID) {
      fields[USUARIOS_ROL_USUARIO_FIELD_ID] = rolUsuario;
    }
    
    // IMPORTANTE: Vincular el usuario a la misma entidad que el usuario raíz
    if (USUARIOS_ENTIDAD_FIELD_ID) {
      fields[USUARIOS_ENTIDAD_FIELD_ID] = [entidadIdValue]; // Array porque es una relación
    }

    // Agregar trazabilidad: quién creó este usuario
    if (USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID) {
      fields[USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID] = creadorNombre;
      console.log('📝 Guardando trazabilidad - Creado por:', creadorNombre);
    }

    console.log('👤 Datos a crear:', JSON.stringify(createData, null, 2));

    // Crear usuario en Airtable
    const createResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(createData)
    });

    console.log('👤 Respuesta de creación:', createResponse.status, createResponse.statusText);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Error creando usuario:', errorText);
      return NextResponse.json({ 
        error: 'Error creando el usuario en el sistema' 
      }, { status: 500 });
    }

    const result = await createResponse.json();
    console.log('✅ Usuario creado exitosamente:', result.records[0].id);

    return NextResponse.json({ 
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: result.records[0].id,
        nombre: nombreCompleto,
        documento: numeroDocumento,
        area: areaEmpresa,
        rol: rolUsuario
      }
    });

  } catch (error) {
    console.error('💥 Error en creación de usuario:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
