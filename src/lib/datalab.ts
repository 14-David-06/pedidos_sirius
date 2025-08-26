import { NextResponse } from 'next/server';

// Configuración de Airtable - DataLab
const DATALAB_API_KEY = process.env.DATALAB_API_KEY;
const DATALAB_BASE_ID = process.env.DATALAB_BASE_ID;
const DATALAB_ORDENES_TABLE = process.env.DATALAB_ORDENES_TABLE_ID;
const DATALAB_PRODUCTOS_TABLE = process.env.DATALAB_PRODUCTOS_TABLE_ID;

export const createDataLabOrder = async (orderData: {
  fechaRecogida?: string;
  clienteRecogeProducto: boolean;
  nombreRecibe?: string;
  cedulaRecibe?: string;
  departamentoEntrega?: string;
  ciudadEntrega?: string;
  direccionEntrega?: string;
  observaciones: string;
  realizaRegistro: string;
  productos: Array<{
    nombre: string;
    cantidad: number;
    unidadMedida: string;
    precioUnitario: number;
  }>;
}) => {
  if (!DATALAB_API_KEY || !DATALAB_BASE_ID || !DATALAB_ORDENES_TABLE || !DATALAB_PRODUCTOS_TABLE) {
    throw new Error('Error de configuración del servidor para DataLab: faltan variables de entorno requeridas');
  }

  try {
    // 1. Crear registros de productos
    const productosData = {
      records: orderData.productos.map(producto => ({
        fields: {
          'Nombre Producto': producto.nombre,
          'Cantidad': producto.cantidad,
          'Unidad de Medida': producto.unidadMedida,
          'Precio Unitario': producto.precioUnitario,
          'Subtotal': producto.cantidad * producto.precioUnitario
        }
      }))
    };

    const productosResponse = await fetch(
      `https://api.airtable.com/v0/${DATALAB_BASE_ID}/${DATALAB_PRODUCTOS_TABLE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DATALAB_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productosData),
      }
    );

    if (!productosResponse.ok) {
      console.error('[DataLab] Error al crear productos:', await productosResponse.text());
      throw new Error('Error al crear productos en DataLab');
    }

    const productosCreados = await productosResponse.json();
    const productosIds = productosCreados.records.map((record: any) => record.id);

    // 2. Crear la orden
    const ordenData = {
      records: [{
        fields: {
          'Fecha Recogida': orderData.fechaRecogida,
          'Cliente Recoge Pedido': orderData.clienteRecogeProducto,
          'Nombre Recibe': orderData.nombreRecibe,
          'Cedula Recibe': orderData.cedulaRecibe,
          'Departamento Entrega': orderData.departamentoEntrega,
          'Ciudad Entrega': orderData.ciudadEntrega,
          'Direccion Entrega': orderData.direccionEntrega,
          'Observaciones': orderData.observaciones,
          'Realiza Registro': orderData.realizaRegistro,
          'Productos Ordenados 2': productosIds
        }
      }]
    };

    const ordenResponse = await fetch(
      `https://api.airtable.com/v0/${DATALAB_BASE_ID}/${DATALAB_ORDENES_TABLE}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DATALAB_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData),
      }
    );

    if (!ordenResponse.ok) {
      console.error('[DataLab] Error al crear orden:', await ordenResponse.text());
      throw new Error('Error al crear orden en DataLab');
    }

    const ordenCreada = await ordenResponse.json();
    return ordenCreada.records[0].id;

  } catch (error) {
    console.error('[DataLab] Error:', error);
    throw error;
  }
};
