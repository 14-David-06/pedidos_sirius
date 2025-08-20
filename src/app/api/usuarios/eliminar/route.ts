import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const USUARIOS_ENTIDAD_FIELD_ID = process.env.USUARIOS_ENTIDAD_FIELD_ID;

export async function POST(request: NextRequest) {
  console.log('🗑️ Iniciando eliminación de usuario regular...');
  
  try {
    const userRootId = request.headers.get('X-User-Root-Id');
    
    if (!userRootId) {
      return NextResponse.json({ 
        error: 'No se pudo identificar el usuario raíz' 
      }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ 
        error: 'ID del usuario es requerido' 
      }, { status: 400 });
    }

    console.log('🗑️ Eliminando usuario:', userId);
    console.log('🏢 Solicitado por empresa:', userRootId);

    // Primero verificar que el usuario a eliminar pertenece a la empresa del usuario raíz
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
    console.log('👤 Datos del usuario a eliminar:', {
      id: userData.id,
      fields: userData.fields,
      entidadField: USUARIOS_ENTIDAD_FIELD_ID,
      entidadValue: userData.fields['Entidad'] || 'NO_ENCONTRADO',
      allFields: Object.keys(userData.fields)
    });
    
    // Verificar que el usuario pertenece a la empresa del usuario raíz
    // Usar el nombre del campo directamente ya que Airtable devuelve nombres, no IDs
    const userEntidad = userData.fields['Entidad'];
    
    console.log('🔍 Verificación de entidad:', {
      userEntidad,
      userRootId,
      hasEntidad: !!userEntidad,
      isArray: Array.isArray(userEntidad),
      includes: userEntidad ? (Array.isArray(userEntidad) ? userEntidad.includes(userRootId) : userEntidad === userRootId) : false
    });
    
    // Si el usuario no tiene entidad asignada o no coincide con el usuario raíz
    if (!userEntidad || (Array.isArray(userEntidad) ? !userEntidad.includes(userRootId) : userEntidad !== userRootId)) {
      console.log('❌ Usuario no pertenece a la empresa del usuario raíz');
      return NextResponse.json({ 
        error: 'No tiene permisos para eliminar este usuario' 
      }, { status: 403 });
    }

    console.log('✅ Usuario verificado, pertenece a la empresa');

    // Proceder con la eliminación
    const deleteResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('🗑️ Respuesta de eliminación:', deleteResponse.status, deleteResponse.statusText);

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      console.error('❌ Error eliminando usuario:', errorText);
      return NextResponse.json({ 
        error: 'Error eliminando el usuario del sistema' 
      }, { status: 500 });
    }

    const result = await deleteResponse.json();
    console.log('✅ Usuario eliminado exitosamente:', result.id);

    return NextResponse.json({ 
      success: true,
      message: 'Usuario eliminado exitosamente',
      deletedUserId: result.id
    });

  } catch (error) {
    console.error('💥 Error en eliminación de usuario:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
