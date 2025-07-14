import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PEDIDOS_TABLE = 'Venta Biochar Blend'; // Tabla de pedidos

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

    // Buscar pedidos por cédula en Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PEDIDOS_TABLE}`;
    const params = new URLSearchParams({
      filterByFormula: `{NIT/Cedula Comprador} = "${cedula}"`,
      sort: JSON.stringify([{ field: 'Fecha Venta', direction: 'desc' }]) // Ordenar por fecha más reciente
    });

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Error details:', errorData);
      return NextResponse.json({ error: 'Error al buscar pedidos' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      pedidos: data.records || [],
      total: data.records ? data.records.length : 0
    });

  } catch (error) {
    console.error('Error searching pedidos:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
