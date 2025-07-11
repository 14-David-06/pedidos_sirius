import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const orderData = await request.json();

    const order = await OrderService.create(
      user.id,
      user.name,
      user.email,
      orderData
    );

    if (!order) {
      return NextResponse.json(
        { error: 'Error al crear la solicitud' },
        { status: 500 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    let orders;
    if (user.role === 'admin') {
      orders = await OrderService.getAll();
    } else {
      orders = await OrderService.getByUserId(user.id);
    }

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return NextResponse.json(
      { error: 'Error al obtener solicitudes' },
      { status: 500 }
    );
  }
}
