import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Clientes Pirolisis'; // Nombre de la tabla donde están las cédulas

export async function POST(request: NextRequest) {
  try {
    const { cedula } = await request.json();
    console.log('=== VALIDACIÓN DE CÉDULA ===');
    console.log('Cédula recibida:', cedula);

    if (!cedula) {
      console.log('ERROR: Cédula vacía');
      return NextResponse.json({ error: 'Cédula es requerida' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.error('ERROR: Configuración de Airtable faltante');
      console.log('AIRTABLE_API_KEY existe:', !!AIRTABLE_API_KEY);
      console.log('AIRTABLE_BASE_ID existe:', !!AIRTABLE_BASE_ID);
      return NextResponse.json({ error: 'Configuración del servidor incompleta' }, { status: 500 });
    }

    console.log('Configuración OK - Buscando en tabla:', AIRTABLE_TABLE_NAME);

    // Buscar la cédula en Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const params = new URLSearchParams({
      filterByFormula: `{Cedula Solicitante} = "${cedula}"`,
      maxRecords: '1'
    });

    console.log('URL completa:', `${url}?${params}`);
    console.log('Filtro aplicado:', `{Cedula Solicitante} = "${cedula}"`);

    const response = await fetch(`${url}?${params}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Airtable API error:', response.status, response.statusText);
      console.error('Error response body:', errorText);
      return NextResponse.json({ error: 'Error al validar la cédula' }, { status: 500 });
    }

    const data = await response.json();
    console.log('Respuesta de Airtable:', JSON.stringify(data, null, 2));
    
    const isValid = data.records && data.records.length > 0;
    console.log('¿Cédula válida?', isValid);
    
    if (isValid) {
      console.log('Cliente encontrado:', data.records[0].fields);
    }

    return NextResponse.json({ 
      isValid,
      cliente: isValid ? data.records[0].fields : null 
    });

  } catch (error) {
    console.error('Error completo en validación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
