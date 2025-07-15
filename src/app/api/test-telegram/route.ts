import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';

export async function POST(request: NextRequest) {
  try {
    // Datos de prueba
    const testPedidoData = {
      cedula: '1006774686',
      nombreCliente: 'David Hernandez',
      razonSocialCliente: 'Empresa de Prueba S.A.S.',
      cantidad: 100,
      unidadMedida: 'BigBag',
      precioTotal: 119000,
      destino: 'Prueba desde API',
      cantidadBigBags: 1,
      cantidadLonas: 0
    };

    await sendTelegramNotification(testPedidoData);
    
    return NextResponse.json({ 
      success: true,
      message: 'Notificación de prueba enviada exitosamente',
      testData: testPedidoData
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Error al enviar notificación de prueba'
    }, { status: 500 });
  }
}
