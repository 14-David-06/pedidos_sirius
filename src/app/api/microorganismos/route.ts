import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable para Microorganismos
const MICROORGANISMOS_API_KEY = process.env.MICROORGANISMOS_API_KEY;
const MICROORGANISMOS_BASE_ID = process.env.MICROORGANISMOS_BASE_ID;
const MICROORGANISMOS_TABLE_ID = process.env.MICROORGANISMOS_TABLE_ID;

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [API] Obteniendo lista de microorganismos...');

    // Verificar variables de entorno
    if (!MICROORGANISMOS_API_KEY || !MICROORGANISMOS_BASE_ID || !MICROORGANISMOS_TABLE_ID) {
      console.error('❌ [API] Variables de entorno de microorganismos no configuradas');
      return NextResponse.json(
        { error: 'Configuración de microorganismos no disponible' },
        { status: 500 }
      );
    }

    // Construir URL para obtener microorganismos
    const url = `https://api.airtable.com/v0/${MICROORGANISMOS_BASE_ID}/${MICROORGANISMOS_TABLE_ID}`;
    
    // Obtener solo los campos necesarios para el dropdown
    const fields = ['Microorganismo', 'Abreviaturas', 'Tipo Microorganismo', 'Bolsas/Lote', 'Dias/Incubacion'];
    const fieldsQuery = fields.map(field => `fields%5B%5D=${encodeURIComponent(field)}`).join('&');
    const finalUrl = `${url}?${fieldsQuery}&sort%5B0%5D%5Bfield%5D=Microorganismo&sort%5B0%5D%5Bdirection%5D=asc`;

    console.log('🔧 [API] URL de consulta:', finalUrl);

    const response = await fetch(finalUrl, {
      headers: {
        'Authorization': `Bearer ${MICROORGANISMOS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ [API] Error consultando Airtable microorganismos:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ [API] Error details:', errorText);
      throw new Error(`Error consultando base de datos de microorganismos: ${response.status}`);
    }

    const data = await response.json();

    if (!data.records) {
      console.log('❌ [API] No se encontraron microorganismos');
      return NextResponse.json(
        { error: 'No se encontraron microorganismos' },
        { status: 404 }
      );
    }

    // Filtrar microorganismos que NO contengan "+" en el nombre
    const microorganismosFiltrados = data.records
      .filter((record: any) => {
        const nombre = record.fields['Microorganismo'] || '';
        return !nombre.includes('+');
      })
      .map((record: any) => ({
        id: record.id,
        nombre: record.fields['Microorganismo'] || '',
        abreviatura: record.fields['Abreviaturas'] || '',
        tipo: record.fields['Tipo Microorganismo'] || '',
        bolsasLote: record.fields['Bolsas/Lote'] || 0,
        diasIncubacion: record.fields['Dias/Incubacion'] || 0
      }));

    console.log('✅ [API] Microorganismos obtenidos:', {
      total: data.records.length,
      filtrados: microorganismosFiltrados.length,
      excluidos: data.records.length - microorganismosFiltrados.length
    });

    return NextResponse.json({
      success: true,
      microorganismos: microorganismosFiltrados,
      total: microorganismosFiltrados.length
    });

  } catch (error) {
    console.error('💥 [API] Error obteniendo microorganismos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
