import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/lib/telegram';
import { createDataLabOrder } from '@/lib/datalab';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas según la documentación
const ORDENES_COMPRAS_TABLE_ID = process.env.PEDIDOS_ORDENES_COMPRAS_TABLE_ID;
const PRODUCTOS_ORDENADOS_TABLE_ID = process.env.PEDIDOS_PRODUCTOS_ORDENADOS_TABLE_ID;

// Field IDs para Ordenes Compras
const FECHA_RECOGIDA_FIELD = process.env.PEDIDOS_FECHA_RECOGIDA_FIELD_ID;
const CLIENTE_RECOGE_PEDIDO_FIELD = process.env.PEDIDOS_CLIENTE_RECOGE_PEDIDO_FIELD_ID;
const NOMBRE_RECIBE_FIELD = process.env.PEDIDOS_NOMBRE_RECIBE_FIELD_ID;
const CEDULA_RECIBE_FIELD = process.env.PEDIDOS_CEDULA_RECIBE_FIELD_ID;
const DEPARTAMENTO_ENTREGA_FIELD = process.env.PEDIDOS_DEPARTAMENTO_ENTREGA_FIELD_ID;
const CIUDAD_ENTREGA_FIELD = process.env.PEDIDOS_CIUDAD_ENTREGA_FIELD_ID;
const DIRECCION_ENTREGA_FIELD = process.env.PEDIDOS_DIRECCION_ENTREGA_FIELD_ID;
const OBSERVACIONES_FIELD = process.env.PEDIDOS_OBSERVACIONES_FIELD_ID;
const PRODUCTOS_ORDENADOS_FIELD = process.env.PEDIDOS_PRODUCTOS_ORDENADOS_FIELD_ID;
const REALIZA_REGISTRO_FIELD = process.env.PEDIDOS_REALIZA_REGISTRO_FIELD_ID;
const CLIENTE_FIELD = process.env.PEDIDOS_CLIENTE_FIELD_ID;

// Field IDs para Productos Ordenados
const NOMBRE_PRODUCTO_FIELD = process.env.PEDIDOS_NOMBRE_PRODUCTO_FIELD_ID;
const CANTIDAD_FIELD = process.env.PEDIDOS_CANTIDAD_FIELD_ID;
const UNIDAD_MEDIDA_FIELD = process.env.PEDIDOS_UNIDAD_MEDIDA_FIELD_ID;
const PRECIO_UNITARIO_FIELD = process.env.PEDIDOS_PRECIO_UNITARIO_FIELD_ID;
const SUBTOTAL_FIELD = process.env.PEDIDOS_SUBTOTAL_FIELD_ID;
const ORDEN_COMPRA_FIELD = process.env.PEDIDOS_ORDEN_COMPRA_FIELD_ID;

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    console.log('Datos recibidos:', JSON.stringify(requestBody, null, 2));
    
    // Validar que todas las variables de entorno requeridas estén configuradas
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !ORDENES_COMPRAS_TABLE_ID ||
        !PRODUCTOS_ORDENADOS_TABLE_ID || !FECHA_RECOGIDA_FIELD ||
        !CLIENTE_RECOGE_PEDIDO_FIELD || !NOMBRE_RECIBE_FIELD ||
        !CEDULA_RECIBE_FIELD || !DEPARTAMENTO_ENTREGA_FIELD ||
        !CIUDAD_ENTREGA_FIELD || !DIRECCION_ENTREGA_FIELD ||
        !OBSERVACIONES_FIELD || !PRODUCTOS_ORDENADOS_FIELD ||
        !REALIZA_REGISTRO_FIELD || !CLIENTE_FIELD ||
        !NOMBRE_PRODUCTO_FIELD || !CANTIDAD_FIELD ||
        !UNIDAD_MEDIDA_FIELD || !PRECIO_UNITARIO_FIELD ||
        !SUBTOTAL_FIELD || !ORDEN_COMPRA_FIELD) {
      console.error('❌ Error de configuración: faltan variables de entorno requeridas para crear pedido');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    const {
      usuario,
      tipo,
      recogesPedido,
      fechaEntrega,
      observaciones,
      microorganismosSeleccionados,
      biocharTipo,
      biocharCantidad,
      biocharUnidad,
      nombreRecibe,
      cedulaRecibe,
      departamento,
      ciudad,
      direccionEntrega,
      precioTotal,
      totalLitros
    } = requestBody;

    // Extraer datos del usuario
    const usuarioId = usuario?.id || usuario?.documento || 'N/A';
    const usuarioNombre = usuario?.nombre || 'N/A';
    const usuarioEmail = usuario?.usuario || 'N/A'; // Usando el campo 'usuario' como email

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    // Validaciones básicas
    if (!usuarioId || !usuarioNombre || !tipo || !fechaEntrega) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    // Validación para entrega
    if (recogesPedido === 'no' && (!nombreRecibe || !cedulaRecibe || !departamento || !ciudad || !direccionEntrega)) {
      return NextResponse.json({ error: 'Faltan datos de entrega' }, { status: 400 });
    }

    // Validación para productos biológicos
    if (tipo === 'biologicos' && (!microorganismosSeleccionados || microorganismosSeleccionados.length === 0)) {
      return NextResponse.json({ error: 'Debe seleccionar al menos un microorganismo' }, { status: 400 });
    }

    // Validación para biochar
    if (tipo === 'biochar' && (!biocharTipo || !biocharCantidad || !biocharUnidad)) {
      return NextResponse.json({ error: 'Faltan datos del producto biochar' }, { status: 400 });
    }

    // Buscar el usuario raíz asociado
    let usuarioRaizId = null;
    
    console.log('Buscando usuario raíz para:', { 
      usuarioId, 
      tipoUsuario: usuario?.tipoUsuario, 
      documento: usuario?.documento,
      id: usuario?.id 
    });
    
    if (usuario?.tipoUsuario === 'raiz') {
      // Si el usuario actual es raíz, usar su ID directamente
      usuarioRaizId = usuarioId;
      console.log('Usuario es raíz, usando su propio ID:', usuarioRaizId);
    } else {
      // Si es usuario genérico, buscar el usuario raíz asociado
      try {
        // Primero intentar buscar en usuarios genéricos
        const usuariosTableId = process.env.USUARIOS_TABLE_ID;
        const documentoFieldId = process.env.USUARIOS_NUMERO_DOCUMENTO_FIELD_ID;
        
        let usuariosGenericosUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${usuariosTableId!}`;
        
        // Buscar por el ID del usuario (que es el record ID en Airtable)
        console.log('Buscando usuario genérico por record ID:', usuario?.id);
        
        // En lugar de filter, obtener directamente el registro por ID
        if (usuario?.id) {
          try {
            const usuarioGenericoResponse = await fetch(`${usuariosGenericosUrl}/${usuario.id}`, {
              headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
            });

            if (usuarioGenericoResponse.ok) {
              const usuarioGenerico = await usuarioGenericoResponse.json();
              console.log('Usuario genérico encontrado por ID directo:', usuarioGenerico);
              
              // Obtener la entidad (usuario raíz) asociada
              const entidadField = process.env.USUARIOS_ENTIDAD_FIELD_ID;
              console.log('Buscando campo entidad:', entidadField);
              console.log('Campos del usuario genérico:', Object.keys(usuarioGenerico.fields || {}));
              
              if (usuarioGenerico.fields && usuarioGenerico.fields[entidadField!] && Array.isArray(usuarioGenerico.fields[entidadField!]) && usuarioGenerico.fields[entidadField!].length > 0) {
                usuarioRaizId = usuarioGenerico.fields[entidadField!][0];
                console.log('Usuario raíz encontrado desde entidad:', usuarioRaizId);
              } else {
                console.log('No se encontró campo entidad o está vacío');
              }
            } else {
              console.log('No se encontró usuario genérico por ID directo');
            }
          } catch (error) {
            console.error('Error buscando por ID directo:', error);
          }
        }
        
        // Si no se encontró por ID directo, intentar con filter por documento
        if (!usuarioRaizId && usuario?.documento) {
          console.log('Intentando buscar por documento:', usuario.documento);
          
          const filterFormula = `{${documentoFieldId}} = "${usuario.documento}"`;
          
          const usuarioGenericoResponse = await fetch(`${usuariosGenericosUrl}?filterByFormula=${encodeURIComponent(filterFormula)}`, {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (usuarioGenericoResponse.ok) {
            const usuarioGenericoData = await usuarioGenericoResponse.json();
            console.log('Respuesta de búsqueda por documento:', usuarioGenericoData);
            
            if (usuarioGenericoData.records && usuarioGenericoData.records.length > 0) {
              const usuarioGenerico = usuarioGenericoData.records[0];
              const entidadField = process.env.USUARIOS_ENTIDAD_FIELD_ID;
              
              if (usuarioGenerico.fields[entidadField!] && Array.isArray(usuarioGenerico.fields[entidadField!]) && usuarioGenerico.fields[entidadField!].length > 0) {
                usuarioRaizId = usuarioGenerico.fields[entidadField!][0];
                console.log('Usuario raíz encontrado por documento:', usuarioRaizId);
              }
            }
          }
        }
        
        // Si aún no se encuentra, usar un usuario raíz por defecto (temporal para testing)
        if (!usuarioRaizId) {
          console.log('No se encontró usuario raíz, buscando cualquier usuario raíz disponible...');
          
          // Buscar en la tabla de usuarios raíz directamente
          const usuariosRaizTableId = process.env.USUARIOS_RAIZ_TABLE_ID;
          const usuariosRaizUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${usuariosRaizTableId!}?maxRecords=1`;
          
          try {
            const usuariosRaizResponse = await fetch(usuariosRaizUrl, {
              headers: {
                'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (usuariosRaizResponse.ok) {
              const usuariosRaizData = await usuariosRaizResponse.json();
              console.log('Usuarios raíz disponibles:', usuariosRaizData);
              
              if (usuariosRaizData.records && usuariosRaizData.records.length > 0) {
                usuarioRaizId = usuariosRaizData.records[0].id;
                console.log('Usando primer usuario raíz disponible:', usuarioRaizId);
              }
            }
          } catch (error) {
            console.error('Error buscando usuarios raíz:', error);
          }
        }
        
      } catch (error) {
        console.error('Error general buscando usuario raíz:', error);
      }
    }

    console.log('Usuario raíz encontrado:', { usuarioRaizId, tipoUsuario: usuario?.tipoUsuario, documento: usuario?.documento });

    // 1. Crear la orden de compra principal
    const ordenCompraData = {
      fields: {
        // Fecha Creacion se crea automáticamente
        [FECHA_RECOGIDA_FIELD]: fechaEntrega, // Fecha Recogida
        [CLIENTE_RECOGE_PEDIDO_FIELD]: recogesPedido === 'si', // Cliente Recoge Pedido (checkbox)
        [OBSERVACIONES_FIELD]: observaciones || '', // Solo las observaciones del usuario
        [REALIZA_REGISTRO_FIELD]: usuarioNombre, // Nombre de quien realiza el pedido
        [CLIENTE_FIELD]: usuarioRaizId ? [usuarioRaizId] : [], // ID del usuario raíz (relación)
        
        // Solo agregar campos de entrega si no recoge el pedido
        ...(recogesPedido === 'no' && {
          [NOMBRE_RECIBE_FIELD]: nombreRecibe, // Nombre Recibe
          [CEDULA_RECIBE_FIELD]: cedulaRecibe, // Cedula Recibe
          [DEPARTAMENTO_ENTREGA_FIELD]: departamento, // Departamento Entrega
          [CIUDAD_ENTREGA_FIELD]: ciudad, // Ciudad Entrega
          [DIRECCION_ENTREGA_FIELD]: direccionEntrega, // Direccion Entrega
        })
      }
    };

    console.log('Creando orden de compra:', JSON.stringify(ordenCompraData, null, 2));

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
      console.error('Error al crear orden de compra:', errorData);
      return NextResponse.json({ 
        error: 'Error al crear la orden de compra',
        details: errorData 
      }, { status: 500 });
    }

    const ordenCompraResult = await ordenCompraResponse.json();
    const ordenCompraId = ordenCompraResult.records[0].id;

    console.log('Orden de compra creada:', ordenCompraId);

    // 2. Crear los productos ordenados
    const productosACrear = [];

    if (tipo === 'biologicos' && microorganismosSeleccionados) {
      // Crear un registro por cada microorganismo seleccionado
      for (const micro of microorganismosSeleccionados) {
        const precioUnitario = 38000; // $38,000 COP por litro
        const subtotal = micro.cantidad * precioUnitario;
        
        productosACrear.push({
          fields: {
            [NOMBRE_PRODUCTO_FIELD]: micro.microorganismoNombre, // Nombre Producto
            [CANTIDAD_FIELD]: micro.cantidad, // Cantidad
            [UNIDAD_MEDIDA_FIELD]: 'L', // Unidad de Medida (Litros)
            [PRECIO_UNITARIO_FIELD]: precioUnitario, // Precio Unitario
            [SUBTOTAL_FIELD]: subtotal, // Subtotal
            [ORDEN_COMPRA_FIELD]: [ordenCompraId] // Orden Compra (link)
          }
        });
      }
    } else if (tipo === 'biochar') {
      // Crear un registro para el producto biochar
      productosACrear.push({
        fields: {
          [NOMBRE_PRODUCTO_FIELD]: biocharTipo, // Nombre Producto
          [CANTIDAD_FIELD]: parseFloat(biocharCantidad), // Cantidad
          [UNIDAD_MEDIDA_FIELD]: biocharUnidad, // Unidad de Medida
          [PRECIO_UNITARIO_FIELD]: 0, // Precio Unitario (por definir)
          [SUBTOTAL_FIELD]: 0, // Subtotal (por definir)
          [ORDEN_COMPRA_FIELD]: [ordenCompraId] // Orden Compra (link)
        }
      });
    }

    // Crear los productos en lotes de 10 (límite de Airtable)
    const productosIds = [];
    for (let i = 0; i < productosACrear.length; i += 10) {
      const lote = productosACrear.slice(i, i + 10);
      
      console.log(`Creando lote de productos ${i + 1}-${Math.min(i + 10, productosACrear.length)}:`, JSON.stringify(lote, null, 2));

      const productosResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${PRODUCTOS_ORDENADOS_TABLE_ID}`, {
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
        console.error('Error al crear productos:', errorData);
        // Continuar con el siguiente lote en caso de error
        continue;
      }

      const productosResult = await productosResponse.json();
      const loteIds = productosResult.records.map((record: any) => record.id);
      productosIds.push(...loteIds);
    }

    console.log('Productos creados:', productosIds);

    // 3. Actualizar la orden de compra con los productos creados
    if (productosIds.length > 0) {
      const updateOrdenResponse = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDENES_COMPRAS_TABLE_ID}/${ordenCompraId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            [PRODUCTOS_ORDENADOS_FIELD]: productosIds // Productos Ordenados (link)
          }
        })
      });

      if (!updateOrdenResponse.ok) {
        const errorData = await updateOrdenResponse.text();
        console.error('Error al vincular productos con orden:', errorData);
      }
    }

    // 4. Crear el pedido en DataLab
    try {
      if (tipo === 'biologicos' && microorganismosSeleccionados) {
        const dataLabProductos = microorganismosSeleccionados.map((micro: { microorganismoNombre: string, cantidad: number }) => ({
          nombre: micro.microorganismoNombre,
          cantidad: micro.cantidad,
          unidadMedida: 'L',
          precioUnitario: 38000
        }));

        await createDataLabOrder({
          fechaRecogida: fechaEntrega,
          clienteRecogeProducto: recogesPedido === 'si',
          nombreRecibe: recogesPedido === 'no' ? nombreRecibe : undefined,
          cedulaRecibe: recogesPedido === 'no' ? cedulaRecibe : undefined,
          departamentoEntrega: recogesPedido === 'no' ? departamento : undefined,
          ciudadEntrega: recogesPedido === 'no' ? ciudad : undefined,
          direccionEntrega: recogesPedido === 'no' ? direccionEntrega : undefined,
          observaciones: observaciones || '',
          realizaRegistro: usuarioNombre,
          productos: dataLabProductos
        });
      }

      // 5. Enviar notificación por Telegram
      const tipoProducto = tipo === 'biologicos' ? 'Productos Biológicos' : 'Biochar';
      const entregaInfo = recogesPedido === 'si' ? 'Cliente recoge' : `Entrega en ${ciudad}, ${departamento}`;
      
      let productosInfo = '';
      if (tipo === 'biologicos' && microorganismosSeleccionados) {
        productosInfo = microorganismosSeleccionados.map((m: any) => 
          `• ${m.microorganismoNombre}: ${m.cantidad}L`
        ).join('\n');
        productosInfo += `\n💰 Total: ${totalLitros}L - ${new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0
        }).format(precioTotal || 0)}`;
      } else if (tipo === 'biochar') {
        productosInfo = `• ${biocharTipo}: ${biocharCantidad} ${biocharUnidad}`;
      }

      const mensaje = `🧪 *NUEVO PEDIDO - ${tipoProducto.toUpperCase()}*

👤 *Cliente:* ${usuarioNombre}
📧 *Email:* ${usuarioEmail}
🆔 *ID Usuario:* ${usuarioId}

📦 *Productos:*
${productosInfo}

📅 *Fecha de ${recogesPedido === 'si' ? 'recogida' : 'entrega'}:* ${fechaEntrega}
🚚 *Modalidad:* ${entregaInfo}

${observaciones ? `📝 *Observaciones:* ${observaciones}` : ''}

🔗 *ID Orden:* ${ordenCompraId}`;

      // Para compatibilidad con la función de Telegram existente, creamos un objeto temporal
      const pedidoDataForTelegram = {
        cedula: usuarioId || 'N/A',
        nombreCliente: usuarioNombre || 'N/A',
        razonSocialCliente: usuarioNombre || 'N/A',
        cantidad: totalLitros || biocharCantidad || 0,
        unidadMedida: tipo === 'biologicos' ? 'Litros' : biocharUnidad || 'kg',
        precioTotal: precioTotal || 0,
        destino: recogesPedido === 'si' ? 'Cliente recoge' : `${ciudad}, ${departamento}`
      };
      
      await sendTelegramNotification(pedidoDataForTelegram);
    } catch (telegramError) {
      console.error('Error enviando notificación Telegram:', telegramError);
      // No devolver error por fallo de Telegram
    }

    return NextResponse.json({
      success: true,
      message: 'Pedido creado exitosamente',
      ordenId: ordenCompraId,
      productosIds: productosIds
    });

  } catch (error) {
    console.error('Error en create-pedido:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}