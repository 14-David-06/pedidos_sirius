import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas desde variables de entorno
const CRONOGRAMA_APLICACIONES_TABLE_ID = process.env.CRONOGRAMA_APLICACIONES_TABLE_ID;
const APLICACIONES_PROGRAMADAS_TABLE_ID = process.env.APLICACIONES_PROGRAMADAS_TABLE_ID;

// Field IDs para Cronograma Aplicaciones desde variables de entorno
const CRONOGRAMA_ID_FIELD = process.env.CRONOGRAMA_ID_FIELD;
const CRONOGRAMA_CREADA_FIELD = process.env.CRONOGRAMA_CREADA_FIELD;
const CRONOGRAMA_APLICACION_FIELD = process.env.CRONOGRAMA_APLICACION_FIELD;
const CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD = process.env.CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD;
const CRONOGRAMA_CICLO_DIAS_FIELD = process.env.CRONOGRAMA_CICLO_DIAS_FIELD;
const CRONOGRAMA_FECHA_INICIO_FIELD = process.env.CRONOGRAMA_FECHA_INICIO_FIELD;
const CRONOGRAMA_REALIZA_REGISTRO_FIELD = process.env.CRONOGRAMA_REALIZA_REGISTRO_FIELD;
const CRONOGRAMA_CLIENTE_FIELD = process.env.CRONOGRAMA_CLIENTE_FIELD;
const CRONOGRAMA_USUARIOS_FIELD = process.env.CRONOGRAMA_USUARIOS_FIELD;
const CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD = process.env.CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD;

// Field IDs para Aplicaciones Programadas desde variables de entorno
const APLICACION_ID_FIELD = process.env.APLICACION_ID_FIELD;
const APLICACION_MICROORGANISMO_FIELD = process.env.APLICACION_MICROORGANISMO_FIELD;
const APLICACION_DOSIS_FIELD = process.env.APLICACION_DOSIS_FIELD;
// const APLICACION_HECTAREAS_FIELD = process.env.APLICACION_HECTAREAS_FIELD;
const APLICACION_CRONOGRAMA_FIELD = process.env.APLICACION_CRONOGRAMA_FIELD;
const APLICACION_FECHA_PROGRAMADA_FIELD = process.env.APLICACION_FECHA_PROGRAMADA_FIELD;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 [API] Datos recibidos para cronograma:', body);

    const {
      aplicacion,
      cantidadAplicaciones,
      cicloDias,
      fechaInicioAplicaciones,
      microorganismosSeleccionados,
      clienteId,
      usuarioId
    } = body;

    // Validaciones de datos de entrada
    if (!aplicacion || !cantidadAplicaciones || !cicloDias || !fechaInicioAplicaciones || !clienteId || !usuarioId) {
      return NextResponse.json({ 
        error: 'Todos los campos del cronograma son requeridos' 
      }, { status: 400 });
    }

    if (!microorganismosSeleccionados || microorganismosSeleccionados.length === 0) {
      return NextResponse.json({ 
        error: 'Debe seleccionar al menos un microorganismo con su dosis' 
      }, { status: 400 });
    }

    // Validaciones de configuración del servidor
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ 
        error: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    // Validar variables de entorno para Cronograma Aplicaciones
    if (!CRONOGRAMA_APLICACIONES_TABLE_ID || !CRONOGRAMA_APLICACION_FIELD || !CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD || 
        !CRONOGRAMA_CICLO_DIAS_FIELD || !CRONOGRAMA_FECHA_INICIO_FIELD || 
        !CRONOGRAMA_CLIENTE_FIELD || !CRONOGRAMA_USUARIOS_FIELD || !CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD) {
      console.error('❌ [API] Variables de entorno de Cronograma no configuradas');
      return NextResponse.json({ 
        error: 'Error de configuración del servidor - Variables de cronograma no configuradas' 
      }, { status: 500 });
    }

    // Validar variables de entorno para Aplicaciones Programadas
    if (!APLICACIONES_PROGRAMADAS_TABLE_ID || !APLICACION_MICROORGANISMO_FIELD || !APLICACION_DOSIS_FIELD || 
        !APLICACION_CRONOGRAMA_FIELD) {
      console.error('❌ [API] Variables de entorno de Aplicaciones Programadas no configuradas');
      return NextResponse.json({ 
        error: 'Error de configuración del servidor - Variables de aplicaciones programadas no configuradas' 
      }, { status: 500 });
    }

    console.log('📝 [API] Creando aplicaciones programadas para cada microorganismo...');

    // Paso 1: Crear las aplicaciones programadas para cada microorganismo
    const aplicacionesCreadasIds = [];
    
    for (const microSeleccionado of microorganismosSeleccionados) {
      // TODO: Reactivar validación de fechas cuando se implemente el campo en Airtable
      // // Validar que la fecha programada sea posterior a la fecha de inicio
      // if (microSeleccionado.fechaProgramada) {
      //   const fechaInicio = new Date(fechaInicioAplicaciones);
      //   const fechaProgramada = new Date(microSeleccionado.fechaProgramada);
      //   
      //   if (fechaProgramada <= fechaInicio) {
      //     return NextResponse.json({ 
      //       error: `La fecha programada para el microorganismo ${microSeleccionado.nombre || 'seleccionado'} debe ser posterior a la fecha de inicio de aplicaciones (${fechaInicioAplicaciones})` 
      //     }, { status: 400 });
      //   }
      // }

      const aplicacionData = {
        records: [{
          fields: {
            [APLICACION_MICROORGANISMO_FIELD]: microSeleccionado.microorganismoNombre,
            [APLICACION_DOSIS_FIELD]: parseFloat(microSeleccionado.dosis)
            // TODO: Agregar fecha programada cuando se cree el campo en Airtable
            // ...(microSeleccionado.fechaProgramada && APLICACION_FECHA_PROGRAMADA_FIELD && {
            //   [APLICACION_FECHA_PROGRAMADA_FIELD]: microSeleccionado.fechaProgramada
            // })
          }
        }]
      };

      console.log('🔍 [API] Creando aplicación programada:', aplicacionData);

      const aplicacionResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${APLICACIONES_PROGRAMADAS_TABLE_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aplicacionData)
      });

      if (!aplicacionResponse.ok) {
        const errorText = await aplicacionResponse.text();
        console.error('❌ [API] Error creando aplicación programada:', errorText);
        throw new Error(`Error creando aplicación programada: ${aplicacionResponse.status} - ${errorText}`);
      }

      const aplicacionResult = await aplicacionResponse.json();
      aplicacionesCreadasIds.push(aplicacionResult.records[0].id);
      console.log('✅ [API] Aplicación programada creada:', aplicacionResult.records[0].id);
    }

    console.log('📝 [API] Creando cronograma de aplicaciones...');

    // Paso 2: Crear el cronograma de aplicaciones
    const cronogramaData = {
      records: [{
        fields: {
          [CRONOGRAMA_APLICACION_FIELD]: aplicacion,
          [CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD]: parseInt(cantidadAplicaciones),
          [CRONOGRAMA_CICLO_DIAS_FIELD]: parseInt(cicloDias),
          [CRONOGRAMA_FECHA_INICIO_FIELD]: fechaInicioAplicaciones,
          [CRONOGRAMA_CLIENTE_FIELD]: [clienteId],
          [CRONOGRAMA_USUARIOS_FIELD]: [usuarioId],
          [CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD]: aplicacionesCreadasIds
        }
      }]
    };

    console.log('🔍 [API] Creando cronograma:', cronogramaData);

    const cronogramaResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CRONOGRAMA_APLICACIONES_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cronogramaData)
    });

    if (!cronogramaResponse.ok) {
      const errorText = await cronogramaResponse.text();
      console.error('❌ [API] Error creando cronograma:', errorText);
      throw new Error(`Error creando cronograma: ${cronogramaResponse.status} - ${errorText}`);
    }

    const cronogramaResult = await cronogramaResponse.json();

    // Paso 3: Actualizar las aplicaciones programadas con la referencia al cronograma
    console.log('🔗 [API] Vinculando aplicaciones programadas al cronograma...');
    
    for (const aplicacionId of aplicacionesCreadasIds) {
      const updateData = {
        records: [{
          id: aplicacionId,
          fields: {
            [APLICACION_CRONOGRAMA_FIELD]: [cronogramaResult.records[0].id]
          }
        }]
      };

      const updateResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${APLICACIONES_PROGRAMADAS_TABLE_ID}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!updateResponse.ok) {
        console.error('⚠️ [API] Error vinculando aplicación programada:', aplicacionId);
      } else {
        console.log('✅ [API] Aplicación programada vinculada:', aplicacionId);
      }
    }

    console.log('✅ [API] Cronograma creado exitosamente:', cronogramaResult.records[0].id);

    return NextResponse.json({
      success: true,
      message: 'Cronograma de aplicaciones creado exitosamente',
      cronograma: {
        id: cronogramaResult.records[0].id,
        aplicacion,
        cantidadAplicaciones,
        cicloDias,
        microorganismosSeleccionados,
        aplicacionesProgramadas: aplicacionesCreadasIds
      }
    });

  } catch (error) {
    console.error('💥 [API] Error creando cronograma:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al crear el cronograma' },
      { status: 500 }
    );
  }
}