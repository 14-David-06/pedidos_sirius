import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Clientes Pirolisis'; // Tabla donde se registran los usuarios

export async function POST(request: NextRequest) {
  try {
    const { cedula, nombre, telefono, finca } = await request.json();

    if (!cedula || !nombre || !telefono) {
      return NextResponse.json({ error: 'Cédula, nombre y teléfono son requeridos' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Verificar si el usuario ya existe
    const searchUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    const searchParams = new URLSearchParams({
      filterByFormula: `{Cédula} = "${cedula}"`
    });

    const searchResponse = await fetch(`${searchUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!searchResponse.ok) {
      return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 });
    }

    const searchData = await searchResponse.json();
    
    if (searchData.records.length > 0) {
      return NextResponse.json({ error: 'El usuario ya está registrado' }, { status: 409 });
    }

    // Crear nuevo usuario
    const createUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const createResponse = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          'Cédula': cedula,
          'Nombre': nombre,
          'Teléfono': telefono,
          'Finca': finca || '',
          'Fecha de Registro': new Date().toISOString()
        }
      })
    });

    if (!createResponse.ok) {
      return NextResponse.json({ error: 'Error al crear el usuario' }, { status: 500 });
    }

    const createData = await createResponse.json();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Usuario registrado exitosamente',
      user: {
        cedula: createData.fields.Cédula,
        nombre: createData.fields.Nombre,
        telefono: createData.fields.Teléfono,
        finca: createData.fields.Finca
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
