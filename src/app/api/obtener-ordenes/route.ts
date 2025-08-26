import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// ID de la tabla Ordenes Compras
const ORDENES_COMPRAS_TABLE_ID = process.env.ORDENES_COMPRAS_TABLE_ID;

// Field IDs para la tabla Ordenes Compras según la documentación
const ORDENES_COMPRAS_FIELDS = {
  ID: process.env.ORDENES_COMPRAS_ID_FIELD_ID,
  NUMERO_ORDEN: process.env.ORDENES_COMPRAS_NUMERO_ORDEN_FIELD_ID,
  FECHA_CREACION: process.env.ORDENES_COMPRAS_FECHA_CREACION_FIELD_ID,
  FECHA_ENTREGA_REQUERIDA: process.env.ORDENES_COMPRAS_FECHA_ENTREGA_REQUERIDA_FIELD_ID,
  ESTADO_ORDEN: process.env.ORDENES_COMPRAS_ESTADO_ORDEN_FIELD_ID,
  AREA: process.env.ORDENES_COMPRAS_AREA_FIELD_ID,
  DESCRIPCION_ORDEN_COMPRA: process.env.ORDENES_COMPRAS_DESCRIPCION_ORDEN_COMPRA_FIELD_ID,
  PRODUCTOS_ORDENADOS: process.env.ORDENES_COMPRAS_PRODUCTOS_ORDENADOS_FIELD_ID,
  TIPO_BIOLOGICO: process.env.ORDENES_COMPRAS_TIPO_BIOLOGICO_FIELD_ID
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const usuarioId = searchParams.get('usuarioId');
    const tipoUsuario = searchParams.get('tipoUsuario');

    // Validar que todas las variables de entorno requeridas estén configuradas
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !ORDENES_COMPRAS_TABLE_ID ||
        !ORDENES_COMPRAS_FIELDS.ID || !ORDENES_COMPRAS_FIELDS.NUMERO_ORDEN ||
        !ORDENES_COMPRAS_FIELDS.FECHA_CREACION || !ORDENES_COMPRAS_FIELDS.FECHA_ENTREGA_REQUERIDA ||
        !ORDENES_COMPRAS_FIELDS.ESTADO_ORDEN || !ORDENES_COMPRAS_FIELDS.AREA ||
        !ORDENES_COMPRAS_FIELDS.DESCRIPCION_ORDEN_COMPRA || !ORDENES_COMPRAS_FIELDS.PRODUCTOS_ORDENADOS ||
        !ORDENES_COMPRAS_FIELDS.TIPO_BIOLOGICO) {
      console.error('❌ Error de configuración: faltan variables de entorno requeridas para órdenes');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Construir URL de la API de Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDENES_COMPRAS_TABLE_ID}`;
    
    // Para usuarios raíz, obtener todas las órdenes; para usuarios regulares, filtrar por usuario
    let filterFormula = '';
    if (tipoUsuario !== 'raiz' && usuarioId) {
      // En este caso necesitaríamos un campo que relacione las órdenes con el usuario
      // Por ahora, usuarios regulares verán todas las órdenes (se puede ajustar después)
    }

    const searchParamsAirtable = new URLSearchParams({
      sort: JSON.stringify([{field: ORDENES_COMPRAS_FIELDS.FECHA_CREACION!, direction: 'desc'}]),
      maxRecords: '100'
    });

    if (filterFormula) {
      searchParamsAirtable.set('filterByFormula', filterFormula);
    }

    console.log('🔍 Consultando órdenes en Airtable:', `${airtableUrl}?${searchParamsAirtable}`);

    const response = await fetch(`${airtableUrl}?${searchParamsAirtable}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response from Airtable:', errorText);
      return NextResponse.json({ error: 'Error al consultar las órdenes' }, { status: 500 });
    }

    const data = await response.json();
    console.log('📋 Órdenes encontradas:', data.records?.length || 0);

    // Mapear los datos de Airtable al formato esperado por el frontend
    const ordenes = data.records?.map((record: any) => {
      const fields = record.fields;
      
      return {
        id: record.id,
        numeroOrden: fields[ORDENES_COMPRAS_FIELDS.NUMERO_ORDEN!] || 'N/A',
        fechaCreacion: fields[ORDENES_COMPRAS_FIELDS.FECHA_CREACION!] || '',
        fechaEntregaRequerida: fields[ORDENES_COMPRAS_FIELDS.FECHA_ENTREGA_REQUERIDA!] || '',
        estado: fields[ORDENES_COMPRAS_FIELDS.ESTADO_ORDEN!] || 'Pendiente',
        area: fields[ORDENES_COMPRAS_FIELDS.AREA!] || '',
        descripcion: fields[ORDENES_COMPRAS_FIELDS.DESCRIPCION_ORDEN_COMPRA!] || '',
        tipoBiologico: fields[ORDENES_COMPRAS_FIELDS.TIPO_BIOLOGICO!] || '',
        productosOrdenados: fields[ORDENES_COMPRAS_FIELDS.PRODUCTOS_ORDENADOS!] || []
      };
    }) || [];

    return NextResponse.json({
      success: true,
      ordenes: ordenes,
      total: ordenes.length,
      message: ordenes.length > 0 ? 'Órdenes obtenidas exitosamente' : 'No se encontraron órdenes'
    });

  } catch (error) {
    console.error('💥 Error en obtener-ordenes:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}

// También permitir POST para mantener compatibilidad
export async function POST(request: NextRequest) {
  return GET(request);
}
