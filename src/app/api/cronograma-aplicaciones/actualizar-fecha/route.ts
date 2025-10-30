import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas desde variables de entorno
const APLICACIONES_PROGRAMADAS_TABLE_ID = process.env.APLICACIONES_PROGRAMADAS_TABLE_ID;

// Field IDs para Aplicaciones Programadas desde variables de entorno
const APLICACION_FECHA_PROGRAMADA_FIELD = process.env.APLICACION_FECHA_PROGRAMADA_FIELD;
const CRONOGRAMA_FECHA_INICIO_FIELD = process.env.CRONOGRAMA_FECHA_INICIO_FIELD;

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [API] Actualizando fecha de aplicación:', body);

    const {
      aplicacionId,
      fechaProgramada,
      fechaInicioAplicaciones
    } = body;

    // Validaciones
    if (!aplicacionId || !fechaProgramada) {
      return NextResponse.json({ 
        error: 'ID de aplicación y fecha programada son requeridos' 
      }, { status: 400 });
    }

    // Validar que la fecha programada sea posterior a la fecha de inicio
    if (fechaInicioAplicaciones) {
      const fechaInicio = new Date(fechaInicioAplicaciones);
      const fechaProgram = new Date(fechaProgramada);
      
      if (fechaProgram <= fechaInicio) {
        return NextResponse.json({ 
          error: `La fecha programada debe ser posterior a la fecha de inicio de aplicaciones (${fechaInicioAplicaciones})` 
        }, { status: 400 });
      }
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ 
        error: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    // Validar variables de entorno
    if (!APLICACIONES_PROGRAMADAS_TABLE_ID || !APLICACION_FECHA_PROGRAMADA_FIELD) {
      console.error('❌ [API] Variables de entorno no configuradas');
      return NextResponse.json({ 
        error: 'Error de configuración del servidor - Variables no configuradas' 
      }, { status: 500 });
    }

    console.log('📝 [API] Actualizando fecha de aplicación programada...');

    const updateData = {
      records: [{
        id: aplicacionId,
        fields: {
          [APLICACION_FECHA_PROGRAMADA_FIELD]: fechaProgramada
        }
      }]
    };

    console.log('🔍 [API] Datos de actualización:', updateData);

    const response = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${APLICACIONES_PROGRAMADAS_TABLE_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Error actualizando fecha:', errorText);
      throw new Error(`Error actualizando fecha: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('✅ [API] Fecha actualizada correctamente:', result);

    return NextResponse.json({
      success: true,
      message: 'Fecha de aplicación actualizada correctamente',
      aplicacion: result.records[0]
    });

  } catch (error) {
    console.error('💥 [API] Error actualizando fecha de aplicación:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al actualizar fecha de aplicación' },
      { status: 500 }
    );
  }
}