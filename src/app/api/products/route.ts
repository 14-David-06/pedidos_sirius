import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET() {
  try {
    const products = await ProductService.getAll();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}
