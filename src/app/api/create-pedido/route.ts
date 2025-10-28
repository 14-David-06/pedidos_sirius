import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas
const ORDENES_COMPRAS_TABLE_ID = process.env.PEDIDOS_ORDENES_COMPRAS_TABLE_ID;
const PRODUCTOS_ORDENES_TABLE_ID = process.env.PEDIDOS_PRODUCTOS_ORDENES_TABLE_ID;

// Field IDs para Ordenes Compras
const FECHA_RECOGIDA_FIELD = process.env.PEDIDOS_FECHA_RECOGIDA_FIELD_ID;
const AREA_SIRIUS_FIELD = process.env.PEDIDOS_AREA_SIRIUS_FIELD_ID;
const ESTADO_ORDEN_FIELD = process.env.PEDIDOS_ESTADO_ORDEN_FIELD_ID;
const NECESITA_ENVIO_FIELD = process.env.PEDIDOS_NECESITA_ENVIO_FIELD_ID;
const UBICACION_APLICACION_FIELD = process.env.PEDIDOS_UBICACION_APLICACION_FIELD_ID;
const OBSERVACIONES_FIELD = process.env.PEDIDOS_OBSERVACIONES_FIELD_ID;
const REALIZA_REGISTRO_FIELD = process.env.PEDIDOS_REALIZA_REGISTRO_FIELD_ID;
const PRODUCTOS_ORDENADOS_FIELD = process.env.PEDIDOS_PRODUCTOS_ORDENADOS_FIELD_ID;
const USUARIOS_FIELD = process.env.PEDIDOS_USUARIOS_FIELD_ID;

// Field IDs para Productos Ordenes
const NOMBRE_PRODUCTO_FIELD = process.env.PEDIDOS_NOMBRE_PRODUCTO_FIELD_ID;
const CANTIDAD_FIELD = process.env.PEDIDOS_CANTIDAD_FIELD_ID;
const UNIDAD_MEDIDA_FIELD = process.env.PEDIDOS_UNIDAD_MEDIDA_FIELD_ID;
const PRECIO_UNITARIO_FIELD = process.env.PEDIDOS_PRECIO_UNITARIO_FIELD_ID;
const SUBTOTAL_FIELD = process.env.PEDIDOS_SUBTOTAL_FIELD_ID;
const ORDEN_COMPRA_FIELD = process.env.PEDIDOS_ORDEN_COMPRA_FIELD_ID;

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 [create-pedido] Iniciando proceso...');
    const requestBody = await request.json();
    console.log('🔵 [create-pedido] Datos recibidos:', JSON.stringify(requestBody, null, 2));
    
    // Validar que todas las variables de entorno requeridas estén configuradas
    console.log('🔵 [create-pedido] Validando variables de entorno...');
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || 
        !ORDENES_COMPRAS_TABLE_ID || !PRODUCTOS_ORDENES_TABLE_ID ||
        !FECHA_RECOGIDA_FIELD || !AREA_SIRIUS_FIELD || !ESTADO_ORDEN_FIELD ||
        !NECESITA_ENVIO_FIELD || !UBICACION_APLICACION_FIELD || !OBSERVACIONES_FIELD ||
        !REALIZA_REGISTRO_FIELD || !PRODUCTOS_ORDENADOS_FIELD || !USUARIOS_FIELD ||
        !NOMBRE_PRODUCTO_FIELD || !CANTIDAD_FIELD || !UNIDAD_MEDIDA_FIELD ||
        !PRECIO_UNITARIO_FIELD || !SUBTOTAL_FIELD || !ORDEN_COMPRA_FIELD) {
      console.error('❌ Error de configuración: faltan variables de entorno requeridas para crear pedido');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }
    console.log('🔵 [create-pedido] Variables de entorno validadas correctamente');

    const {
      usuario,
      tipo,
      recogesPedido,
      fechaEntrega,
      ubicacionAplicacion,
      observaciones,
      microorganismosSeleccionados,
      biocharTipo,
      biocharCantidad,
      biocharUnidad,
      precioTotal,
      totalLitros
    } = requestBody;

    console.log('🔵 [create-pedido] Datos extraídos:', {
      usuario: usuario ? 'Presente' : 'Ausente',
      tipo,
      recogesPedido,
      fechaEntrega,
      ubicacionAplicacion,
      observaciones,
      microorganismosCount: microorganismosSeleccionados?.length || 0,
      biocharTipo,
      biocharCantidad,
      biocharUnidad,
      precioTotal,
      totalLitros
    });

    // Extraer datos del usuario
    console.log('🔍 Datos del usuario recibidos:', usuario);
    const usuarioId = usuario?.id || usuario?.documento || 'N/A';
    
    // Intentar múltiples campos para obtener el nombre del usuario
    let usuarioNombre = 'Usuario Desconocido';
    if (usuario?.nombre) {
      usuarioNombre = usuario.nombre;
    } else if (usuario?.nombreCompleto) {
      usuarioNombre = usuario.nombreCompleto;
    } else if (usuario?.nombreRazonSocial) {
      usuarioNombre = usuario.nombreRazonSocial;
    } else if (usuario?.usuario) {
      usuarioNombre = usuario.usuario;
    }
    
    const usuarioEmail = usuario?.usuario || 'N/A';
    
    console.log('📋 Datos del usuario procesados:', {
      usuarioId,
      usuarioNombre,
      usuarioEmail,
      tipoUsuario: usuario?.tipoUsuario
    });

    // Validaciones básicas
    if (!usuarioId || !usuarioNombre || !tipo || !fechaEntrega) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Validación para productos biológicos
    if (tipo === 'biologicos' && (!microorganismosSeleccionados || microorganismosSeleccionados.length === 0)) {
      return NextResponse.json({ error: 'Debe seleccionar al menos un microorganismo' }, { status: 400 });
    }

    // Validación para biochar
    if (tipo === 'biochar' && (!biocharTipo || !biocharCantidad || !biocharUnidad)) {
      return NextResponse.json({ error: 'Faltan datos del producto biochar' }, { status: 400 });
    }

    // Construir observaciones del usuario si existen
    let observacionesCliente = '';
    if (observaciones && observaciones.trim() !== '') {
      observacionesCliente = observaciones;
    }

    // Crear la orden de compra
    const ordenCompraData = {
      fields: {
        [FECHA_RECOGIDA_FIELD]: fechaEntrega,
        [AREA_SIRIUS_FIELD]: tipo === 'biologicos' ? 'Laboratorio' : 'Pirolisis',
        [ESTADO_ORDEN_FIELD]: 'Pendiente',
        [NECESITA_ENVIO_FIELD]: recogesPedido === 'no',
        [UBICACION_APLICACION_FIELD]: ubicacionAplicacion || '',
        [OBSERVACIONES_FIELD]: observacionesCliente,
        [REALIZA_REGISTRO_FIELD]: usuarioNombre,
        [USUARIOS_FIELD]: usuarioId ? [usuarioId] : [],
      }
    };

    console.log('📝 Creando orden de compra con datos:', JSON.stringify(ordenCompraData, null, 2));

    const ordenCompraResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDENES_COMPRAS_TABLE_ID}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: [ordenCompraData]
      })
    });

    if (!ordenCompraResponse.ok) {
      const errorData = await ordenCompraResponse.text();
      console.error('❌ Error al crear orden de compra:', errorData);
      return NextResponse.json({ 
        error: 'Error al crear la orden de compra',
        details: errorData 
      }, { status: 500 });
    }

    const ordenCompraResult = await ordenCompraResponse.json();
    const ordenCompraId = ordenCompraResult.records[0].id;

    console.log('✅ Orden de compra creada exitosamente:', ordenCompraId);

    // Crear los productos ordenados
    const productosACrear = [];

    if (tipo === 'biologicos' && microorganismosSeleccionados) {
      // Crear un registro por cada microorganismo seleccionado
      for (const micro of microorganismosSeleccionados) {
        const precioUnitario = 38000; // $38,000 COP por litro
        const subtotal = micro.cantidad * precioUnitario;
        
        productosACrear.push({
          fields: {
            [NOMBRE_PRODUCTO_FIELD]: micro.microorganismoNombre,
            [CANTIDAD_FIELD]: micro.cantidad,
            [UNIDAD_MEDIDA_FIELD]: 'L',
            [PRECIO_UNITARIO_FIELD]: precioUnitario,
            [SUBTOTAL_FIELD]: subtotal,
            [ORDEN_COMPRA_FIELD]: [ordenCompraId]
          }
        });
      }
    } else if (tipo === 'biochar') {
      // Crear un registro para el producto biochar
      productosACrear.push({
        fields: {
          [NOMBRE_PRODUCTO_FIELD]: biocharTipo,
          [CANTIDAD_FIELD]: parseFloat(biocharCantidad),
          [UNIDAD_MEDIDA_FIELD]: biocharUnidad,
          [PRECIO_UNITARIO_FIELD]: 0, // Por definir
          [SUBTOTAL_FIELD]: 0, // Por definir
          [ORDEN_COMPRA_FIELD]: [ordenCompraId]
        }
      });
    }

    // Crear los productos en lotes de 10 (límite de Airtable)
    const productosIds = [];
    for (let i = 0; i < productosACrear.length; i += 10) {
      const lote = productosACrear.slice(i, i + 10);
      
      console.log(`� Creando lote de productos ${i + 1}-${Math.min(i + 10, productosACrear.length)}:`, JSON.stringify(lote, null, 2));

      const productosResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${PRODUCTOS_ORDENES_TABLE_ID}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          records: lote
        })
      });

      if (!productosResponse.ok) {
        const errorData = await productosResponse.text();
        console.error('❌ Error al crear productos:', errorData);
        // Continuar con el siguiente lote en caso de error
        continue;
      }

      const productosResult = await productosResponse.json();
      const loteIds = productosResult.records.map((record: any) => record.id);
      productosIds.push(...loteIds);
    }

    console.log('✅ Productos creados:', productosIds);

    // Actualizar la orden de compra con los productos creados
    if (productosIds.length > 0) {
      const updateOrdenResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDENES_COMPRAS_TABLE_ID}/${ordenCompraId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            [PRODUCTOS_ORDENADOS_FIELD]: productosIds
          }
        })
      });

      if (!updateOrdenResponse.ok) {
        const errorData = await updateOrdenResponse.text();
        console.error('⚠️ Error al vincular productos con orden:', errorData);
      } else {
        console.log('✅ Productos vinculados a la orden exitosamente');
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido creado exitosamente',
      ordenId: ordenCompraId,
      productosIds: productosIds
    });
  
  } catch (error: any) {
    console.error('💥 Error en create-pedido:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
