import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface CronogramaData {
  aplicacion: string;
  cantidadAplicaciones: number;
  cicloDias: number;
  hectareas: number;
  fechaInicioAplicaciones: string;
  microorganismos: Array<{
    nombre: string;
    dosis: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required' },
        { status: 400 }
      );
    }

    // Obtener lista de microorganismos disponibles
    let microorganismosDisponibles = [];
    try {
      const microResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/microorganismos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (microResponse.ok) {
        const microResult = await microResponse.json();
        if (microResult.success) {
          microorganismosDisponibles = microResult.data.map((m: any) => m.nombre);
        }
      }
    } catch (error) {
      // Si falla, usar lista por defecto
      console.log('Error obteniendo microorganismos, usando lista por defecto');
    }

    // Lista por defecto si no se pueden obtener de la API
    if (microorganismosDisponibles.length === 0) {
      microorganismosDisponibles = [
        'Trichoderma harzianum',
        'Bacillus subtilis', 
        'Pseudomonas fluorescens',
        'Beauveria bassiana',
        'Metarhizium anisopliae',
        'Paecilomyces lilacinus',
        'Bacillus thuringiensis',
        'Rhizobium',
        'Azotobacter',
        'Mycorrhizae',
        'Streptomyces'
      ];
    }

    const prompt = `
Analiza la siguiente transcripción de voz y extrae la información para crear un cronograma de aplicaciones agrícolas.

Transcripción: "${transcript}"

MICROORGANISMOS DISPONIBLES (corrige nombres similares a estos):
${microorganismosDisponibles.map((m: string) => `- ${m}`).join('\n')}

Si menciona un microorganismo que suena similar a alguno de la lista, usa el nombre EXACTO de la lista.

Necesito que extraigas la siguiente información y la devuelvas en formato JSON:

{
  "aplicacion": "tipo de aplicación (Preventivo Foliar, Preventivo Edáfico, Control Plagas, Control Enfermedades, u otro)",
  "cantidadAplicaciones": número de aplicaciones,
  "cicloDias": días entre aplicaciones,
  "hectareas": número de hectáreas,
  "fechaInicioAplicaciones": fecha en formato YYYY-MM-DD (si no se especifica, usar fecha actual + 7 días),
  "microorganismos": [
    {
      "nombre": "nombre del microorganismo (corregido según la lista disponible)",
      "dosis": dosis en litros por hectárea (si no se especifica, usar 1.0)
    }
  ]
}

EJEMPLOS:
- "Aplicación preventiva foliar con tricoderm para 20 hectáreas, 3 aplicaciones cada 15 días"
- "Control de plagas con bacilus turingensis, 50 hectáreas, 2 aplicaciones cada 10 días, dosis 1.5 litros por hectárea"
- "Preventivo edáfico usando mico rrisas para 30 hectáreas"

Si no se menciona algún campo específico, usa valores por defecto razonables:
- aplicacion: "Preventivo Foliar"
- cantidadAplicaciones: 3
- cicloDias: 15
- hectareas: 10
- microorganismos: [{"nombre": "General", "dosis": 1.0}]

IMPORTANTE: Corrige nombres mal pronunciados de microorganismos usando la lista disponible.

Solo devuelve el JSON, sin texto adicional.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un asistente especializado en agricultura que extrae información de cronogramas de aplicaciones agrícolas. Devuelve solo JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.1,
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      );
    }

    try {
      // Intentar parsear el JSON
      const parsedData: CronogramaData = JSON.parse(responseText);
      
      return NextResponse.json({
        success: true,
        data: parsedData,
        originalTranscript: transcript
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('OpenAI response:', responseText);
      
      return NextResponse.json(
        { 
          error: 'Error parsing response from AI',
          details: responseText
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error processing voice command:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}