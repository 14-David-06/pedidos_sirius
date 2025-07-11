import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function POST() {
  try {
    await ProductService.seedProducts();
    return NextResponse.json({ message: 'Productos inicializados correctamente' });
  } catch (error) {
    console.error('Error seeding products:', error);
    return NextResponse.json(
      { error: 'Error al inicializar productos' },
      { status: 500 }
    );
  }
}
