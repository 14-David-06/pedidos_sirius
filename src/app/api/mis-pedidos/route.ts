import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PEDIDOS_TABLE = 'Venta Biochar Blend'; // Tabla de pedidos
const AIRTABLE_CLIENTES_TABLE = 'Clientes Pirolisis'; // Tabla de clientes

export async function POST(request: NextRequest) {
  try {
    const { cedula } = await request.json();

    if (!cedula) {
      return NextResponse.json({ error: 'Cédula es requerida' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 });
    }

    // Primero obtener el ID del cliente desde la tabla de clientes
    const clientesUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_CLIENTES_TABLE}`;
    const clientesParams = new URLSearchParams({
      filterByFormula: `{Cedula Solicitante} = "${cedula}"`,
      maxRecords: '1'
    });

    const clienteResponse = await fetch(`${clientesUrl}?${clientesParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!clienteResponse.ok) {
      console.error('Error al buscar cliente:', clienteResponse.status, clienteResponse.statusText);
      return NextResponse.json({ error: 'Error al validar cliente' }, { status: 500 });
    }

    const clienteData = await clienteResponse.json();
    
    if (!clienteData.records || clienteData.records.length === 0) {
      return NextResponse.json({ 
        success: true,
        pedidos: [],
        total: 0,
        message: 'Cliente no encontrado en el sistema'
      });
    }

    const clienteRecord = clienteData.records[0];
    const clienteId = clienteRecord.id;
    const nombreCliente = clienteRecord.fields['Nombre Solicitante'] || '';

    console.log('Cliente encontrado:', { id: clienteId, nombre: nombreCliente, cedula });

    // Ahora buscar pedidos por ID de cliente (relación)
    const pedidosUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PEDIDOS_TABLE}`;
    const pedidosParams = new URLSearchParams({
      filterByFormula: `SEARCH("${clienteId}", ARRAYJOIN({Cliente Pirolisis})) > 0`
    });

    const pedidosResponse = await fetch(`${pedidosUrl}?${pedidosParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!pedidosResponse.ok) {
      console.error('Airtable API error:', pedidosResponse.status, pedidosResponse.statusText);
      const errorData = await pedidosResponse.json();
      console.error('Error details:', errorData);
      return NextResponse.json({ error: 'Error al buscar pedidos' }, { status: 500 });
    }

    const pedidosData = await pedidosResponse.json();
    
    return NextResponse.json({ 
      success: true,
      pedidos: pedidosData.records || [],
      total: pedidosData.records ? pedidosData.records.length : 0,
      cliente: {
        id: clienteId,
        nombre: nombreCliente,
        cedula: cedula
      }
    });

  } catch (error) {
    console.error('Error searching pedidos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
