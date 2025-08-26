import { NextRequest, NextResponse } from 'next/server';
import { pbkdf2Sync } from 'crypto';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;
const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID;
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID;
const USUARIOS_ROL_USUARIO_FIELD_ID = process.env.USUARIOS_ROL_USUARIO_FIELD_ID;

// Field ID para trazabilidad - quién modificó por última vez
const USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID = process.env.USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID;

// Función para verificar contraseña usando hash y salt
function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const derivedHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return derivedHash === hash;
  } catch (error) {
    console.error('Error verificando contraseña:', error);
    return false;
  }
}

export async function PUT(request: NextRequest) {
  console.log('✏️ Iniciando edición de usuario regular...');
  
  // Validar que todas las variables de entorno requeridas estén configuradas
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USUARIOS_TABLE_ID ||
      !USUARIOS_NOMBRE_COMPLETO_FIELD_ID || !USUARIOS_NUMERO_DOCUMENTO_FIELD_ID ||
      !USUARIOS_AREA_EMPRESA_FIELD_ID || !USUARIOS_ROL_USUARIO_FIELD_ID ||
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

    const { userId, nombre, documento, areaEmpresa, rolUsuario, confirmPassword } = await request.json();

    if (!userId || !nombre || !documento || !areaEmpresa || !rolUsuario || !confirmPassword) {
      return NextResponse.json({ 
        error: 'Todos los campos son requeridos, incluyendo la contraseña de confirmación' 
      }, { status: 400 });
    }

    console.log('✏️ Editando usuario:', userId);
    console.log('🏢 Solicitado por usuario:', userRootId);
    console.log('📝 Nuevos datos:', { nombre, documento, areaEmpresa, rolUsuario });

    // Validar la contraseña del usuario que solicita el cambio
    console.log('🔐 Validando contraseña del usuario solicitante');
    
    let isValidUser = false;
    let userType = '';
    let editorName = ''; // Nombre del usuario que está editando
    
    // Primero intentar validar como usuario raíz
    try {
      const validateRootUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}/${userRootId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (validateRootUserResponse.ok) {
        const rootUserData = await validateRootUserResponse.json();
        const storedHash = rootUserData.fields['Hash'];
        const storedSalt = rootUserData.fields['Salt'];

        if (storedHash && storedSalt) {
          if (verifyPassword(confirmPassword, storedHash, storedSalt)) {
            isValidUser = true;
            userType = 'raiz';
            // Capturar el nombre del usuario raíz para trazabilidad
            editorName = rootUserData.fields['Nombre Razon Social'] || 
                        rootUserData.fields['Nombre Completo'] || 
                        rootUserData.fields['Usuario'] || 
                        'Usuario Raíz';
            console.log('✅ Usuario raíz validado correctamente:', editorName);
          }
        }
      }
    } catch (error) {
      console.log('⚠️ Usuario solicitante no es usuario raíz, verificando como usuario regular...');
    }
    
    // Si no es usuario raíz, verificar como usuario regular con rol Admin
    if (!isValidUser) {
      try {
        const validateRegularUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userRootId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });

        if (validateRegularUserResponse.ok) {
          const regularUserData = await validateRegularUserResponse.json();
          const userRole = regularUserData.fields['Rol Usuario'] || regularUserData.fields['rolUsuario'];
          const storedHash = regularUserData.fields['Hash'];
          const storedSalt = regularUserData.fields['Salt'];
          
          console.log('👤 Usuario regular encontrado:', {
            id: regularUserData.id,
            role: userRole,
            hasHash: !!storedHash,
            hasSalt: !!storedSalt
          });

          // Verificar que el usuario tenga rol Admin
          if (userRole !== 'Admin') {
            return NextResponse.json({ 
              error: 'Solo los usuarios con rol Admin o usuarios raíz pueden editar otros usuarios' 
            }, { status: 403 });
          }

          if (storedHash && storedSalt) {
            if (verifyPassword(confirmPassword, storedHash, storedSalt)) {
              isValidUser = true;
              userType = 'admin';
              // Capturar el nombre del usuario Admin para trazabilidad
              editorName = regularUserData.fields['Nombre Completo'] || 
                          regularUserData.fields['Usuario'] || 
                          regularUserData.fields['Numero Documento'] || 
                          'Usuario Admin';
              console.log('✅ Usuario Admin validado correctamente:', editorName);
            }
          }
        }
      } catch (error) {
        console.error('Error validando usuario regular:', error);
      }
    }
    
    if (!isValidUser) {
      console.log('❌ Contraseña incorrecta o usuario sin permisos');
      return NextResponse.json({ 
        error: 'Contraseña incorrecta o no tiene permisos para esta acción' 
      }, { status: 401 });
    }

    console.log(`✅ Usuario validado como: ${userType}`);

    // Verificar que el usuario a editar existe
    const getUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!getUserResponse.ok) {
      return NextResponse.json({ 
        error: 'Usuario no encontrado' 
      }, { status: 404 });
    }

    const userData = await getUserResponse.json();
    console.log('👤 Usuario a editar:', {
      id: userData.id,
      entidad: userData.fields['Entidad']
    });
    
    // Validar permisos según el tipo de usuario que solicita la edición
    if (userType === 'raiz') {
      // Usuario raíz: obtener su entidad y verificar que el usuario a editar pertenece a la misma entidad
      
      // Obtener la entidad del usuario raíz
      const rootUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_RAIZ_TABLE_ID}/${userRootId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!rootUserResponse.ok) {
        return NextResponse.json({ 
          error: 'Error validando permisos del usuario raíz' 
        }, { status: 500 });
      }

      const rootUserData = await rootUserResponse.json();
      const rootUserEntidad = rootUserData.fields['Entidad'];
      const userToEditEntidad = userData.fields['Entidad'];
      
      console.log('🔍 Validando entidades (Usuario Raíz):', {
        rootUserId: userRootId,
        rootUserEntidad: rootUserEntidad,
        userToEditEntidad: userToEditEntidad
      });

      // Si el usuario raíz tiene entidad específica, usarla para la validación
      let entidadToValidate = userRootId; // Por defecto, su propio ID
      if (rootUserEntidad && Array.isArray(rootUserEntidad) && rootUserEntidad.length > 0) {
        entidadToValidate = rootUserEntidad[0]; // Usar su entidad específica
      }

      // Verificar que el usuario a editar pertenece a la misma entidad
      if (!userToEditEntidad) {
        return NextResponse.json({ 
          error: 'Error: El usuario a editar no tiene entidad asignada' 
        }, { status: 500 });
      }

      const userEntidadArray = Array.isArray(userToEditEntidad) ? userToEditEntidad : [userToEditEntidad];
      
      if (!userEntidadArray.includes(entidadToValidate)) {
        console.log('❌ El usuario no pertenece a la entidad del usuario raíz');
        console.log('🔍 Comparación:', {
          entidadToValidate,
          userEntidadArray
        });
        return NextResponse.json({ 
          error: 'Solo puede editar usuarios de su entidad' 
        }, { status: 403 });
      }
      
      console.log('✅ Usuario raíz puede editar: usuario pertenece a la misma entidad');
    } else if (userType === 'admin') {
      // Usuario Admin: verificar que tanto él como el usuario a editar pertenecen a la misma empresa
      
      // Obtener la empresa del usuario Admin que solicita
      const adminUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userRootId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      if (!adminUserResponse.ok) {
        return NextResponse.json({ 
          error: 'Error validando permisos del usuario Admin' 
        }, { status: 500 });
      }

      const adminUserData = await adminUserResponse.json();
      const adminEntidad = adminUserData.fields['Entidad'];
      const userToEditEntidad = userData.fields['Entidad'];
      
      console.log('🔍 Validando empresas:', {
        adminEntidad: adminEntidad,
        userToEditEntidad: userToEditEntidad
      });

      // Verificar que ambos usuarios pertenecen a la misma empresa
      if (!adminEntidad || !userToEditEntidad) {
        return NextResponse.json({ 
          error: 'Error: No se pudo determinar la empresa de uno de los usuarios' 
        }, { status: 500 });
      }

      const adminEntidadArray = Array.isArray(adminEntidad) ? adminEntidad : [adminEntidad];
      const userEntidadArray = Array.isArray(userToEditEntidad) ? userToEditEntidad : [userToEditEntidad];
      
      const hasCommonEntidad = adminEntidadArray.some(entidad => userEntidadArray.includes(entidad));
      
      if (!hasCommonEntidad) {
        console.log('❌ El usuario Admin no puede editar usuarios de otra empresa');
        return NextResponse.json({ 
          error: 'Solo puede editar usuarios de su misma empresa' 
        }, { status: 403 });
      }
    }

    console.log('✅ Permisos verificados, procediendo con la actualización');

    // Preparar los campos a actualizar
    const fieldsToUpdate: Record<string, any> = {};

    if (USUARIOS_NOMBRE_COMPLETO_FIELD_ID) {
      fieldsToUpdate[USUARIOS_NOMBRE_COMPLETO_FIELD_ID] = nombre;
    }
    if (USUARIOS_NUMERO_DOCUMENTO_FIELD_ID) {
      fieldsToUpdate[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] = documento;
    }
    if (USUARIOS_AREA_EMPRESA_FIELD_ID) {
      fieldsToUpdate[USUARIOS_AREA_EMPRESA_FIELD_ID] = areaEmpresa;
    }
    if (USUARIOS_ROL_USUARIO_FIELD_ID) {
      fieldsToUpdate[USUARIOS_ROL_USUARIO_FIELD_ID] = rolUsuario;
    }

    // Agregar trazabilidad: quién editó este usuario
    if (USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID && editorName) {
      fieldsToUpdate[USUARIOS_ULTIMA_ACTUALIZACION_POR_FIELD_ID] = editorName;
      console.log('📝 Guardando trazabilidad - Editado por:', editorName);
    }

    console.log('🔧 Campos a actualizar:', fieldsToUpdate);

    // Proceder con la actualización
    const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: fieldsToUpdate
      })
    });

    console.log('🔄 Respuesta de actualización:', updateResponse.status, updateResponse.statusText);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Error actualizando usuario:', errorText);
      return NextResponse.json({ 
        error: 'Error actualizando el usuario en el sistema' 
      }, { status: 500 });
    }

    const result = await updateResponse.json();
    console.log('✅ Usuario actualizado exitosamente:', result.id);

    return NextResponse.json({ 
      success: true,
      message: 'Usuario actualizado exitosamente',
      updatedUserId: result.id,
      updatedFields: {
        nombre,
        documento,
        areaEmpresa,
        rolUsuario
      }
    });

  } catch (error) {
    console.error('💥 Error en edición de usuario:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
