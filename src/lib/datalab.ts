import { NextResponse } from 'next/server';

// Configuración de Airtable - DataLab
const DATALAB_API_KEY = process.env.DATALAB_API_KEY;
const DATALAB_BASE_ID = process.env.DATALAB_BASE_ID;
const DATALAB_ORDENES_TABLE = process.env.DATALAB_ORDENES_TABLE_ID;
const DATALAB_PRODUCTOS_TABLE = process.env.DATALAB_PRODUCTOS_TABLE_ID;

export const createDataLabOrder = async (orderData: {
  fechaRecogida?: string;
  clienteRecogeProducto: boolean;
  observaciones: string;
  realizaRegistro: string;
  // Datos del cliente (texto simple en DataLab)
  clienteNombre?: string;
  clienteTipoDocumento?: string;
  clienteNumeroDocumento?: string;
  clienteCiudad?: string;
  clienteDepartamento?: string;
  clienteDireccion?: string;
  // ID del usuario raíz para la relación Cliente
  clienteUsuarioRaizId?: string;
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

    console.log('[DataLab] Creando orden con datos del cliente:', {
      clienteNombre: orderData.clienteNombre,
      clienteTipoDocumento: orderData.clienteTipoDocumento,
      clienteNumeroDocumento: orderData.clienteNumeroDocumento,
      clienteCiudad: orderData.clienteCiudad,
      clienteDepartamento: orderData.clienteDepartamento,
      clienteDireccion: orderData.clienteDireccion,
      clienteUsuarioRaizId: orderData.clienteUsuarioRaizId
    });

    console.log('[DataLab] 🎯 Valor específico para "Nombre o Razón Social (from Cliente)":', orderData.clienteNombre);
    console.log('[DataLab] 🎯 Tipo de dato:', typeof orderData.clienteNombre);
    console.log('[DataLab] 🎯 Es undefined?', orderData.clienteNombre === undefined);
    console.log('[DataLab] 🎯 Es null?', orderData.clienteNombre === null);
    console.log('[DataLab] 🎯 Es "N/A"?', orderData.clienteNombre === 'N/A');

    // 2. Crear la orden
    const ordenData = {
      records: [{
        fields: {
          'Fecha Recogida': orderData.fechaRecogida,
          'Cliente Recoge Pedido': orderData.clienteRecogeProducto,
          'Observaciones': orderData.observaciones,
          'Realiza Registro': orderData.realizaRegistro,
          // Datos del cliente como texto simple (no lookup)
          'Nombre o Razón Social (from Cliente)': orderData.clienteNombre,
          'Tipo Documento (from Cliente)': orderData.clienteTipoDocumento,
          'Numero Documento (from Cliente)': orderData.clienteNumeroDocumento,
          'Ciudad (from Cliente)': orderData.clienteCiudad,
          'Departamento (from Cliente)': orderData.clienteDepartamento,
          'Dirección (from Cliente)': orderData.clienteDireccion,
          // ID del usuario raíz como texto en Cliente Ordenes Compras
          'Cliente Ordenes Compras': orderData.clienteUsuarioRaizId,
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
