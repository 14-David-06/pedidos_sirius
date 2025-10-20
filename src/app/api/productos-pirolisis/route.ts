import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable para productos de pirólisis
const AIRTABLE_API_KEY = process.env.PIROLISIS_API_KEY || process.env.AIRTABLE_API_KEY;
const PIROLISIS_BASE_ID = process.env.PIROLISIS_BASE_ID;
const PIROLISIS_PRODUCTOS_TABLE_ID = process.env.PIROLISIS_PRODUCTOS_TABLE_ID;
const PIROLISIS_ID_FIELD_ID = process.env.PIROLISIS_ID_FIELD_ID;
const PIROLISIS_NOMBRE_PRODUCTO_FIELD_ID = process.env.PIROLISIS_NOMBRE_PRODUCTO_FIELD_ID;
const PIROLISIS_DESCRIPCION_FIELD_ID = process.env.PIROLISIS_DESCRIPCION_FIELD_ID;
const PIROLISIS_UNIDAD_PRODUCTO_FIELD_ID = process.env.PIROLISIS_UNIDAD_PRODUCTO_FIELD_ID;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Iniciando obtención de productos de pirólisis...');
    console.log('Variables de entorno:', {
      AIRTABLE_API_KEY: AIRTABLE_API_KEY ? '✅ Presente' : '❌ Faltante',
      PIROLISIS_BASE_ID: PIROLISIS_BASE_ID || '❌ Faltante',
      PIROLISIS_PRODUCTOS_TABLE_ID: PIROLISIS_PRODUCTOS_TABLE_ID || '❌ Faltante'
    });

    // Validar que todas las variables de entorno estén configuradas
    if (!AIRTABLE_API_KEY || !PIROLISIS_BASE_ID || !PIROLISIS_PRODUCTOS_TABLE_ID) {
      console.error('❌ Error de configuración: faltan variables de entorno básicas para productos de pirólisis');
      return NextResponse.json({ 
        error: 'Error de configuración del servidor para productos de pirólisis',
        productos: [],
        debug: {
          AIRTABLE_API_KEY: !!AIRTABLE_API_KEY,
          PIROLISIS_BASE_ID: !!PIROLISIS_BASE_ID,
          PIROLISIS_PRODUCTOS_TABLE_ID: !!PIROLISIS_PRODUCTOS_TABLE_ID
        }
      }, { status: 500 });
    }

    console.log('🔍 [API] Obteniendo lista de productos de pirólisis...');
    
    // Construir URL para obtener productos (usando nombres de campo primero para testing)
    const params = new URLSearchParams({
      [`fields[0]`]: 'ID',
      [`fields[1]`]: 'Nombre del Producto',
      [`fields[2]`]: 'Descripción',
      [`fields[3]`]: 'Unidad Producto',
      [`sort[0][field]`]: 'Nombre del Producto',
      [`sort[0][direction]`]: 'asc'
    });
    
    const url = `https://api.airtable.com/v0/${PIROLISIS_BASE_ID}/${PIROLISIS_PRODUCTOS_TABLE_ID}?${params}`;
    console.log('🔧 [API] URL de consulta:', url);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [API] Error en respuesta de Airtable:', errorText);
      return NextResponse.json({ 
        error: 'Error al obtener productos de pirólisis',
        productos: []
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('📋 [API] Respuesta de Airtable:', JSON.stringify(data, null, 2));

    // Procesar y mapear los productos usando nombres de campo
    const productos = data.records.map((record: any) => ({
      id: record.id,
      nombre: record.fields['Nombre del Producto'] || 'Producto sin nombre',
      descripcion: record.fields['Descripción'] || '',
      unidad: record.fields['Unidad Producto'] || 'KG'
    }));

    console.log('✅ [API] Productos de pirólisis obtenidos:', { 
      total: productos.length,
      productos: productos.map((p: any) => p.nombre)
    });

    return NextResponse.json({ productos });

  } catch (error) {
    console.error('❌ [API] Error general:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      productos: []
    }, { status: 500 });
  }
}