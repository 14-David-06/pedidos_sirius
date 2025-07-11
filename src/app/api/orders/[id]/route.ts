import { NextRequest, NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { verifyToken } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyToken(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const { status } = await request.json();
    const success = await OrderService.updateStatus(
      params.id,
      status,
      user.name
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Error al actualizar el estado' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
