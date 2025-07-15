import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_PEDIDOS_TABLE = 'Venta Biochar Blend'; // Tabla para guardar los pedidos

export async function POST(request: NextRequest) {
  try {
    const { cedula, cantidad, unidadMedida, unidadPersonalizada, destino } = await request.json();

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

    // Calcular cantidad según la unidad seleccionada
    const cantidadKg = parseInt(cantidad);
    const precioPorKg = 1190; // Precio en COP por kilogramo
    const precioTotal = cantidadKg * precioPorKg; // Precio total del pedido
    
    let cantidadBigBags = 0;
    let cantidadLonas = 0;
    
    if (unidadMedida === 'BigBag') {
      cantidadBigBags = Math.ceil(cantidadKg / 600); // 600kg por BigBag
      cantidadLonas = 0;
    } else if (unidadMedida === 'Lona') {
      cantidadBigBags = 0;
      cantidadLonas = Math.ceil(cantidadKg / 35); // 35kg por Lona
    } else {
      // Si es "Otro", calculamos ambos para referencia pero no los enviamos como cantidad definitiva
      cantidadBigBags = 0;
      cantidadLonas = 0;
    }

    // Primero obtener el ID y nombre del cliente desde la tabla de clientes
    const clientesUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Clientes Pirolisis`;
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

    let nombreCliente = '';
    let razonSocialCliente = '';
    let clienteId = '';
    if (clienteResponse.ok) {
      const clienteData = await clienteResponse.json();
      if (clienteData.records && clienteData.records.length > 0) {
        const clienteRecord = clienteData.records[0];
        nombreCliente = clienteRecord.fields['Nombre Solicitante'] || '';
        razonSocialCliente = clienteRecord.fields['Razon Social Cliente'] || '';
        clienteId = clienteRecord.id; // Este es el ID del registro en Airtable
        console.log('Cliente encontrado:', { 
          id: clienteId, 
          nombre: nombreCliente, 
          razonSocial: razonSocialCliente 
        });
      } else {
        console.error('Cliente no encontrado con cédula:', cedula);
        return NextResponse.json({ error: 'Cliente no encontrado en el sistema' }, { status: 404 });
      }
    } else {
      console.error('Error al buscar cliente:', clienteResponse.status);
      return NextResponse.json({ error: 'Error al validar cliente' }, { status: 500 });
    }

    // Determinar la unidad final a guardar
    const unidadFinal = unidadMedida === 'Otro' ? unidadPersonalizada : unidadMedida;

    // Crear el pedido en Airtable
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PEDIDOS_TABLE}`;
    
    const pedidoData = {
      fields: {
        'NIT/Cedula Comprador': cedula,
        'Peso Vendido (kg)': cantidadKg,
        'Cantidad BigBag': cantidadBigBags,
        'Cantidad Lonas': cantidadLonas,
        'Precio Total': precioTotal, // Precio total del pedido en COP
        'Tipo Envase': unidadFinal,
        // 'Fecha Venta' se omite porque es un campo calculado en Airtable
        'Comprador': nombreCliente, // Nombre del cliente
        'Cliente Pirolisis': clienteId ? [clienteId] : [], // ID del cliente (relación con la tabla)
        'Destino': destino || '', // Destino del pedido (opcional)
        'Operador Responsable': 'Sistema Web', // Indicar que viene del sistema web
        'Estado Pedido': 'En proceso', // Estado por defecto para pedidos nuevos
        'Observaciones': `Pedido realizado desde plataforma web. Cliente: ${nombreCliente} (ID: ${clienteId}). Destino: ${destino || 'No especificado'}. Unidad: ${unidadFinal}, Cantidad: ${cantidadKg} kg${unidadMedida === 'BigBag' ? ` (${cantidadBigBags} BigBag${cantidadBigBags > 1 ? 's' : ''})` : unidadMedida === 'Lona' ? ` (${cantidadLonas} Lona${cantidadLonas > 1 ? 's' : ''})` : ''}. Total: $${precioTotal.toLocaleString('es-CO')} COP`
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
    
    // Enviar notificación por Telegram de forma asíncrona
    try {
      await sendTelegramNotification({
        cedula,
        nombreCliente,
        razonSocialCliente,
        cantidad: cantidadKg,
        unidadMedida: unidadMedida === 'Otro' ? unidadPersonalizada : unidadMedida,
        precioTotal,
        destino,
        cantidadBigBags,
        cantidadLonas
      });
      console.log('✅ Notificación de Telegram enviada exitosamente');
    } catch (telegramError) {
      console.error('❌ Error al enviar notificación de Telegram:', telegramError);
      // No fallar la creación del pedido si hay error en Telegram
    }
    
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
