import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas desde variables de entorno
const CRONOGRAMA_APLICACIONES_TABLE_ID = process.env.CRONOGRAMA_APLICACIONES_TABLE_ID;

// Field IDs para Cronograma Aplicaciones desde variables de entorno
const CRONOGRAMA_ID_FIELD = process.env.CRONOGRAMA_ID_FIELD;
const CRONOGRAMA_CREADA_FIELD = process.env.CRONOGRAMA_CREADA_FIELD;
const CRONOGRAMA_APLICACION_FIELD = process.env.CRONOGRAMA_APLICACION_FIELD;
const CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD = process.env.CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD;
const CRONOGRAMA_CICLO_DIAS_FIELD = process.env.CRONOGRAMA_CICLO_DIAS_FIELD;
const CRONOGRAMA_HECTAREAS_FIELD = process.env.CRONOGRAMA_HECTAREAS_FIELD;
const CRONOGRAMA_FECHA_INICIO_FIELD = process.env.CRONOGRAMA_FECHA_INICIO_FIELD;
const CRONOGRAMA_MICROORGANISMO_FIELD = process.env.CRONOGRAMA_MICROORGANISMO_FIELD;
const CRONOGRAMA_REALIZA_REGISTRO_FIELD = process.env.CRONOGRAMA_REALIZA_REGISTRO_FIELD;
const CRONOGRAMA_CLIENTE_FIELD = process.env.CRONOGRAMA_CLIENTE_FIELD;
const CRONOGRAMA_USUARIOS_FIELD = process.env.CRONOGRAMA_USUARIOS_FIELD;
const CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD = process.env.CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');

    if (!usuarioId) {
      return NextResponse.json({ 
        error: 'ID de usuario es requerido' 
      }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ 
        error: 'Error de configuración del servidor' 
      }, { status: 500 });
    }

    // Validar que todas las variables de entorno necesarias estén definidas
    if (!CRONOGRAMA_APLICACIONES_TABLE_ID || !CRONOGRAMA_USUARIOS_FIELD) {
      console.error('❌ [API] Variables de entorno de Cronograma no configuradas');
      return NextResponse.json({ 
        error: 'Error de configuración del servidor - Variables de cronograma no configuradas' 
      }, { status: 500 });
    }

    console.log('🔍 [API] Obteniendo cronogramas para usuario:', usuarioId);

    // Usar el field ID correcto para Usuarios
    const filterFormula = `{${CRONOGRAMA_USUARIOS_FIELD}}="${usuarioId}"`;
    
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CRONOGRAMA_APLICACIONES_TABLE_ID}`;
    const params = new URLSearchParams({
      filterByFormula: filterFormula
    });

    console.log('📋 [API] URL completa:', `${url}?${params}`);
    console.log('🔍 [API] Filtro aplicado:', filterFormula);

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Error obteniendo cronogramas:', errorText);
      throw new Error(`Error obteniendo cronogramas: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('📊 [API] Respuesta de Airtable:', JSON.stringify(data, null, 2));

    // Usar los field IDs correctos con validación
    const cronogramas = data.records.map((record: any) => ({
      id: record.id,
      aplicacion: CRONOGRAMA_APLICACION_FIELD ? record.fields[CRONOGRAMA_APLICACION_FIELD] || '' : '',
      cantidadAplicaciones: CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD ? record.fields[CRONOGRAMA_CANTIDAD_APLICACIONES_FIELD] || 0 : 0,
      cicloDias: CRONOGRAMA_CICLO_DIAS_FIELD ? record.fields[CRONOGRAMA_CICLO_DIAS_FIELD] || 0 : 0,
      hectareas: CRONOGRAMA_HECTAREAS_FIELD ? record.fields[CRONOGRAMA_HECTAREAS_FIELD] || 0 : 0,
      fechaInicioAplicaciones: CRONOGRAMA_FECHA_INICIO_FIELD ? record.fields[CRONOGRAMA_FECHA_INICIO_FIELD] || '' : '',
      microorganismo: CRONOGRAMA_MICROORGANISMO_FIELD ? record.fields[CRONOGRAMA_MICROORGANISMO_FIELD] || '' : '',
      realizaRegistro: CRONOGRAMA_REALIZA_REGISTRO_FIELD ? record.fields[CRONOGRAMA_REALIZA_REGISTRO_FIELD] || '' : '',
      fechaCreacion: CRONOGRAMA_CREADA_FIELD ? record.fields[CRONOGRAMA_CREADA_FIELD] || '' : '',
      aplicacionesProgramadas: CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD ? record.fields[CRONOGRAMA_APLICACIONES_PROGRAMADAS_FIELD] || [] : []
    }));

    console.log('✅ [API] Cronogramas obtenidos:', cronogramas.length);

    return NextResponse.json({
      success: true,
      cronogramas
    });

  } catch (error) {
    console.error('💥 [API] Error obteniendo cronogramas:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al obtener cronogramas' },
      { status: 500 }
    );
  }
}