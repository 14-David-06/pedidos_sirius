import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID; // tblZmDsMCRDUWBaAQ
const USUARIOS_RAIZ_TABLE_ID = process.env.USUARIOS_RAIZ_TABLE_ID;

// Field IDs para tabla Usuarios
const USUARIOS_ID_FIELD_ID = process.env.USUARIOS_ID_FIELD_ID; // fld4iW1bwIdZHuhDo
const USUARIOS_NOMBRE_COMPLETO_FIELD_ID = process.env.USUARIOS_NOMBRE_COMPLETO_FIELD_ID; // fldqC1HfoKvkcGRBk
const USUARIOS_USUARIO_FIELD_ID = process.env.USUARIOS_USUARIO_FIELD_ID; // fld4gWbMCaxWMNhxN
const USUARIOS_NUMERO_DOCUMENTO_FIELD_ID = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID; // fldSxEmiNaliZO4xh
const USUARIOS_AREA_EMPRESA_FIELD_ID = process.env.USUARIOS_AREA_EMPRESA_FIELD_ID; // fldnHB8guE7SQVLWDText
const USUARIOS_ROL_USUARIO_FIELD_ID = process.env.USUARIOS_ROL_USUARIO_FIELD_ID; // fldfJwAKXkBZmfKzH
const USUARIOS_ENTIDAD_FIELD_ID = process.env.USUARIOS_ENTIDAD_FIELD_ID; // fldSfraisXEx02V71

export async function GET(request: NextRequest) {
  console.log('🔍 [API] Iniciando listado de usuarios...');
  
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('❌ [API] Configuración de Airtable incompleta');
      return NextResponse.json({ 
        error: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    // Obtener el ID del usuario actual y su tipo desde los headers
    const userRootId = request.headers.get('X-User-Root-Id');
    const userType = request.headers.get('X-User-Type') || 'raiz'; // Por defecto raíz
    
    if (!userRootId) {
      console.error('❌ [API] No se proporcionó el ID del usuario');
      return NextResponse.json({ 
        error: 'No autorizado - ID de usuario requerido' 
      }, { status: 401 });
    }

    console.log('🔒 [API] Consultando usuarios para usuario:', userRootId, 'tipo:', userType);
    
    let filterFormula = '';
    let entidadId = userRootId;
    
    // Si es usuario Admin (no raíz), necesitamos obtener su entidad primero
    if (userType === 'admin') {
      console.log('👤 [API] Usuario Admin detectado, obteniendo entidad...');
      
      const adminUserResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userRootId}`, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        }
      });

      if (!adminUserResponse.ok) {
        console.error('❌ [API] Error obteniendo datos del usuario Admin');
        return NextResponse.json({ 
          error: 'No se pudo verificar el usuario administrador' 
        }, { status: 400 });
      }

      const adminUserData = await adminUserResponse.json();
      const adminEntidad = adminUserData.fields[USUARIOS_ENTIDAD_FIELD_ID!] || adminUserData.fields['Entidad'];
      
      if (!adminEntidad || !Array.isArray(adminEntidad) || adminEntidad.length === 0) {
        console.error('❌ [API] Usuario Admin no tiene entidad asignada');
        return NextResponse.json({ 
          error: 'Usuario administrador sin entidad asignada' 
        }, { status: 400 });
      }

      entidadId = adminEntidad[0]; // Tomar el primer elemento del array
      console.log('🏢 [API] Entidad del Admin encontrada:', entidadId);
    }
    
    // Filtrar usuarios por entidad (tanto para raíz como para admin)
    filterFormula = `{${USUARIOS_ENTIDAD_FIELD_ID}} = "${entidadId}"`;
    const encodedFilter = encodeURIComponent(filterFormula);
    
    console.log('📋 [API] Filtro aplicado:', filterFormula);
    
    // Consultar usuarios regulares filtrados por el usuario raíz actual
    const usuariosResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}?filterByFormula=${encodedFilter}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!usuariosResponse.ok) {
      const errorText = await usuariosResponse.text();
      console.error('❌ [API] Error consultando usuarios:', errorText);
      return NextResponse.json({ 
        error: 'Error consultando usuarios de la empresa' 
      }, { status: 500 });
    }

    const usuariosData = await usuariosResponse.json();
    console.log('📋 [API] Usuarios regulares encontrados para esta empresa:', usuariosData.records.length);

    // Procesar SOLO usuarios regulares de esta empresa
    const usuariosRegulares = usuariosData.records.map((record: any) => {
      const fields = record.fields;
      return {
        id: record.id,
        usuario: (USUARIOS_USUARIO_FIELD_ID ? fields[USUARIOS_USUARIO_FIELD_ID] : null) || fields['Usuario'] || 'Sin usuario',
        nombre: (USUARIOS_NOMBRE_COMPLETO_FIELD_ID ? fields[USUARIOS_NOMBRE_COMPLETO_FIELD_ID] : null) || fields['Nombre Completo'] || 'Sin nombre',
        documento: (USUARIOS_NUMERO_DOCUMENTO_FIELD_ID ? fields[USUARIOS_NUMERO_DOCUMENTO_FIELD_ID] : null) || fields['Numero Documento'] || 'Sin documento',
        areaEmpresa: (USUARIOS_AREA_EMPRESA_FIELD_ID ? fields[USUARIOS_AREA_EMPRESA_FIELD_ID] : null) || fields['Area Empresa'] || '',
        rolUsuario: (USUARIOS_ROL_USUARIO_FIELD_ID ? fields[USUARIOS_ROL_USUARIO_FIELD_ID] : null) || fields['Rol Usuario'] || 'Sin rol',
        fechaCreacion: record.createdTime,
        tipoUsuario: 'regular',
        estado: 'activo'
      };
    });

    console.log('✅ [API] Usuarios procesados para entidad:', usuariosRegulares.length);
    console.log('🔒 [API] Filtro de seguridad aplicado correctamente');

    return NextResponse.json({ 
      success: true, 
      usuarios: usuariosRegulares,
      total: usuariosRegulares.length,
      entidadId: entidadId,
      userId: userRootId,
      userType: userType,
      message: userType === 'admin' ? 'Usuarios de su entidad (Admin)' : 'Usuarios de su empresa (Raíz)'
    });

  } catch (error) {
    console.error('💥 [API] Error en listado de usuarios:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}
