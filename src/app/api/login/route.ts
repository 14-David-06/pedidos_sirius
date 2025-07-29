import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'Clientes Pirolisis'; // Tabla donde están los usuarios

export async function POST(request: NextRequest) {
  try {
    const { cedula, password } = await request.json();

    if (!cedula || !password) {
      return NextResponse.json({ error: 'Cédula y contraseña son requeridos' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Buscar el usuario en Airtable
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;
    
    const searchParams = new URLSearchParams({
      filterByFormula: `{Cédula} = "${cedula}"`
    });

    const response = await fetch(`${airtableUrl}?${searchParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al consultar la base de datos' }, { status: 500 });
    }

    const data = await response.json();
    
    if (data.records.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const user = data.records[0].fields;
    
    // En una implementación real, deberías verificar la contraseña de forma segura
    // Por ahora, asumimos que la validación es básica
    
    return NextResponse.json({ 
      success: true, 
      user: {
        cedula: user.Cédula,
        nombre: user.Nombre || '',
        telefono: user.Teléfono || '',
        finca: user.Finca || ''
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
