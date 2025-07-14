import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PEDIDOS_TABLE = 'Pedidos'; // Tabla para guardar los pedidos

export async function POST(request: NextRequest) {
  try {
    const { cedula, cantidad, unidadMedida, unidadPersonalizada } = await request.json();

    if (!cedula || !cantidad || !unidadMedida) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Validar que si es "Otro", se proporcione la unidad personalizada
    if (unidadMedida === 'Otro' && !unidadPersonalizada?.trim()) {
      return NextResponse.json({ error: 'Debe especificar la unidad de medida personalizada' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 });
    }

    // Determinar la unidad final a guardar
    const unidadFinal = unidadMedida === 'Otro' ? unidadPersonalizada : unidadMedida;

    // Crear el pedido en Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PEDIDOS_TABLE}`;
    
    const pedidoData = {
      fields: {
        'Cedula': cedula,
        'Cantidad': parseInt(cantidad),
        'Unidad_Medida': unidadFinal,
        'Fecha_Pedido': new Date().toISOString(),
        'Estado': 'Pendiente',
        'Producto': 'Biochar Blend'
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });

    if (!response.ok) {
      console.error('Airtable API error:', response.status, response.statusText);
      const errorData = await response.json();
      console.error('Error details:', errorData);
      return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 });
    }

    const data = await response.json();
    
    return NextResponse.json({ 
      success: true,
      pedidoId: data.id,
      message: 'Pedido creado exitosamente'
    });

  } catch (error) {
    console.error('Error creating pedido:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
