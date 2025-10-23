import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
    const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
    const ORDENES_COMPRAS_TABLE_ID = process.env.PEDIDOS_ORDENES_COMPRAS_TABLE_ID;

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !ORDENES_COMPRAS_TABLE_ID) {
      return NextResponse.json({ error: 'Variables de entorno faltantes' }, { status: 500 });
    }

    // Obtener el esquema de la tabla para ver todos los campos disponibles
    const schemaResponse = await fetch(`https://api.airtable.com/v0/meta/bases/${AIRTABLE_BASE_ID}/tables`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!schemaResponse.ok) {
      const errorData = await schemaResponse.text();
      return NextResponse.json({ 
        error: 'Error obteniendo esquema de base',
        details: errorData 
      }, { status: 500 });
    }

    const schemaData = await schemaResponse.json();
    
    // Buscar la tabla de Ordenes Compras
    const ordenesTable = schemaData.tables.find((table: any) => table.id === ORDENES_COMPRAS_TABLE_ID);
    
    if (!ordenesTable) {
      return NextResponse.json({ 
        error: 'Tabla de Ordenes Compras no encontrada',
        availableTables: schemaData.tables.map((t: any) => ({ id: t.id, name: t.name }))
      }, { status: 404 });
    }

    // Obtener información de todos los campos
    const campos = ordenesTable.fields.map((field: any) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      options: field.options || null
    }));

    return NextResponse.json({
      success: true,
      tableName: ordenesTable.name,
      tableId: ordenesTable.id,
      campos,
      // Buscar específicamente campos relacionados con "Cliente Recoge Pedido"
      camposRelacionados: campos.filter((campo: any) => 
        campo.name.toLowerCase().includes('cliente') || 
        campo.name.toLowerCase().includes('recoge') ||
        campo.name.toLowerCase().includes('pedido')
      )
    });

  } catch (error: any) {
    console.error('Error en diagnóstico:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}