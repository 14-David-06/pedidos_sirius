import { NextRequest, NextResponse } from 'next/server';

// Configuración de Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// IDs de las tablas
const ORDENES_COMPRAS_TABLE_ID = process.env.PEDIDOS_ORDENES_COMPRAS_TABLE_ID;
const PRODUCTOS_ORDENES_TABLE_ID = process.env.PEDIDOS_PRODUCTOS_ORDENES_TABLE_ID;
const USUARIOS_TABLE_ID = process.env.USUARIOS_TABLE_ID;
const CLIENTES_TABLE_ID = process.env.CLIENTES_TABLE_ID; // Tabla de Entidades/Clientes

// Field IDs
const USUARIOS_ENTIDAD_FIELD_ID = process.env.USUARIOS_ENTIDAD_FIELD_ID;

// Field IDs para Productos Ordenes
const PRODUCTOS_ID_FIELD_ID = process.env.PRODUCTOS_ORDENES_ID_FIELD_ID;
const PRODUCTOS_NOMBRE_FIELD_ID = process.env.PRODUCTOS_ORDENES_NOMBRE_FIELD_ID;
const PRODUCTOS_CANTIDAD_FIELD_ID = process.env.PRODUCTOS_ORDENES_CANTIDAD_FIELD_ID;
const PRODUCTOS_UNIDAD_MEDIDA_FIELD_ID = process.env.PRODUCTOS_ORDENES_UNIDAD_MEDIDA_FIELD_ID;
const PRODUCTOS_PRECIO_UNITARIO_FIELD_ID = process.env.PRODUCTOS_ORDENES_PRECIO_UNITARIO_FIELD_ID;
const PRODUCTOS_SUBTOTAL_FIELD_ID = process.env.PRODUCTOS_ORDENES_SUBTOTAL_FIELD_ID;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario es requerido' }, { status: 400 });
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID || !USUARIOS_TABLE_ID || 
        !ORDENES_COMPRAS_TABLE_ID || !PRODUCTOS_ORDENES_TABLE_ID || 
        !CLIENTES_TABLE_ID || !USUARIOS_ENTIDAD_FIELD_ID ||
        !PRODUCTOS_ID_FIELD_ID || !PRODUCTOS_NOMBRE_FIELD_ID || 
        !PRODUCTOS_CANTIDAD_FIELD_ID || !PRODUCTOS_UNIDAD_MEDIDA_FIELD_ID ||
        !PRODUCTOS_PRECIO_UNITARIO_FIELD_ID || !PRODUCTOS_SUBTOTAL_FIELD_ID) {
      console.error('❌ [mis-pedidos] Faltan variables de entorno requeridas');
      return NextResponse.json({ error: 'Error de configuración del servidor' }, { status: 500 });
    }

    console.log('🔍 [mis-pedidos] Obteniendo datos del usuario:', userId);

    // 1. Obtener la entidad del usuario
    const usuarioUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${USUARIOS_TABLE_ID}/${userId}`;
    
    const usuarioResponse = await fetch(usuarioUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!usuarioResponse.ok) {
      console.error('❌ [mis-pedidos] Error al obtener usuario');
      return NextResponse.json({ error: 'Error al obtener datos del usuario' }, { status: 500 });
    }

    const usuarioData = await usuarioResponse.json();
    const entidadField = usuarioData.fields[USUARIOS_ENTIDAD_FIELD_ID] || usuarioData.fields['Entidad'];
    
    if (!entidadField || !Array.isArray(entidadField) || entidadField.length === 0) {
      console.log('⚠️ [mis-pedidos] Usuario no tiene entidad asignada');
      return NextResponse.json({ 
        success: true,
        ordenes: [],
        total: 0,
        message: 'Usuario sin entidad asignada'
      });
    }

    const entidadId = entidadField[0];
    console.log('🏢 [mis-pedidos] Entidad del usuario (ID):', entidadId);

    // 1.5. Obtener el nombre de la entidad desde la tabla de Clientes
    const entidadUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${CLIENTES_TABLE_ID}/${entidadId}`;
    const entidadResponse = await fetch(entidadUrl, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    let nombreEntidad = null;
    if (entidadResponse.ok) {
      const entidadData = await entidadResponse.json();
      console.log('📋 [mis-pedidos] Campos de la entidad:', Object.keys(entidadData.fields));
      // Intentar obtener el nombre de la entidad de varios campos posibles
      nombreEntidad = entidadData.fields['Nombre o Razón Social'] || 
                      entidadData.fields['Nombre'] || 
                      entidadData.fields['Razon Social'] ||
                      entidadData.fields['Name'];
      console.log('🏢 [mis-pedidos] Nombre de la entidad:', nombreEntidad);
    } else {
      const errorText = await entidadResponse.text();
      console.log('⚠️ [mis-pedidos] No se pudo obtener el nombre de la entidad. Error:', errorText);
      console.log('⚠️ [mis-pedidos] Usando ID en su lugar');
    }

    // 2. Obtener todas las órdenes de compra de esa entidad
    const ordenesUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${ORDENES_COMPRAS_TABLE_ID}`;
    
    // Buscar por nombre de cliente si está disponible, sino por ID
    const searchValue = nombreEntidad || entidadId;
    const ordenesParams = new URLSearchParams({
      filterByFormula: `SEARCH("${searchValue}", ARRAYJOIN({Cliente})) > 0`
    });

    console.log('🔍 [mis-pedidos] Buscando órdenes para:', searchValue);

    const ordenesResponse = await fetch(`${ordenesUrl}?${ordenesParams}`, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!ordenesResponse.ok) {
      const errorText = await ordenesResponse.text();
      console.error('❌ [mis-pedidos] Error al buscar órdenes. Status:', ordenesResponse.status);
      console.error('❌ [mis-pedidos] Detalles del error:', errorText);
      return NextResponse.json({ error: 'Error al buscar órdenes' }, { status: 500 });
    }

    const ordenesData = await ordenesResponse.json();
    const ordenes = ordenesData.records || [];

    console.log(`📦 [mis-pedidos] Órdenes encontradas: ${ordenes.length}`);
    
    // Debug: Si no hay órdenes, obtener todas para ver qué clientes tienen
    if (ordenes.length === 0) {
      console.log('🔍 [mis-pedidos] No se encontraron órdenes. Verificando todas las órdenes disponibles...');
      const allOrdenesResponse = await fetch(ordenesUrl, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (allOrdenesResponse.ok) {
        const allOrdenesData = await allOrdenesResponse.json();
        if (allOrdenesData.records && allOrdenesData.records.length > 0) {
          console.log('📋 [mis-pedidos] Total de órdenes en la base:', allOrdenesData.records.length);
          console.log('📋 [mis-pedidos] Cliente IDs en las primeras órdenes:');
          allOrdenesData.records.slice(0, 3).forEach((orden: any, index: number) => {
            console.log(`   Orden ${index + 1}:`, {
              id: orden.id,
              cliente: orden.fields['Cliente'],
              realizaRegistro: orden.fields['Realiza Registro']
            });
          });
        }
      }
    }

    // 3. Para cada orden, obtener sus productos
    const ordenesConProductos = await Promise.all(
      ordenes.map(async (orden: any) => {
        const ordenId = orden.id;
        
        // Obtener productos de esta orden
        const productosUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${PRODUCTOS_ORDENES_TABLE_ID}`;
        const productosParams = new URLSearchParams({
          filterByFormula: `SEARCH("${ordenId}", ARRAYJOIN({Orden Compra})) > 0`
        });

        try {
          const productosResponse = await fetch(`${productosUrl}?${productosParams}`, {
            headers: {
              'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          });

          if (productosResponse.ok) {
            const productosData = await productosResponse.json();
            const productos = (productosData.records || []).map((prod: any) => ({
              id: prod.fields[PRODUCTOS_ID_FIELD_ID!] || prod.id,
              nombreProducto: prod.fields[PRODUCTOS_NOMBRE_FIELD_ID!] || prod.fields['Nombre Producto'] || '',
              cantidad: prod.fields[PRODUCTOS_CANTIDAD_FIELD_ID!] || prod.fields['Cantidad'] || 0,
              unidadMedida: prod.fields[PRODUCTOS_UNIDAD_MEDIDA_FIELD_ID!] || prod.fields['Unidad de Medida'] || '',
              precioUnitario: prod.fields[PRODUCTOS_PRECIO_UNITARIO_FIELD_ID!] || prod.fields['Precio Unitario'] || 0,
              subtotal: prod.fields[PRODUCTOS_SUBTOTAL_FIELD_ID!] || prod.fields['Subtotal'] || 0,
            }));

            // Calcular total
            const total = productos.reduce((sum: number, prod: any) => sum + (prod.subtotal || 0), 0);

            return {
              id: orden.id,
              fechaRecogida: orden.fields['Fecha Recogida'] || '',
              areaSirius: orden.fields['Area Sirius'] || '',
              estadoOrden: orden.fields['Estado de Orden'] || 'Pendiente',
              necesitaEnvio: orden.fields['Necesita Envio'] || false,
              ubicacionAplicacion: orden.fields['Ubicacion de Aplicacion'] || '',
              observaciones: orden.fields['Observaciones'] || '',
              realizaRegistro: orden.fields['Realiza Registro'] || '',
              productos: productos,
              total: total
            };
          } else {
            console.error(`❌ Error al obtener productos para orden ${ordenId}`);
            return {
              id: orden.id,
              fechaRecogida: orden.fields['Fecha Recogida'] || '',
              areaSirius: orden.fields['Area Sirius'] || '',
              estadoOrden: orden.fields['Estado de Orden'] || 'Pendiente',
              necesitaEnvio: orden.fields['Necesita Envio'] || false,
              ubicacionAplicacion: orden.fields['Ubicacion de Aplicacion'] || '',
              observaciones: orden.fields['Observaciones'] || '',
              realizaRegistro: orden.fields['Realiza Registro'] || '',
              productos: [],
              total: 0
            };
          }
        } catch (error) {
          console.error(`❌ Error procesando orden ${ordenId}:`, error);
          return {
            id: orden.id,
            fechaRecogida: orden.fields['Fecha Recogida'] || '',
            areaSirius: orden.fields['Area Sirius'] || '',
            estadoOrden: orden.fields['Estado de Orden'] || 'Pendiente',
            necesitaEnvio: orden.fields['Necesita Envio'] || false,
            ubicacionAplicacion: orden.fields['Ubicacion de Aplicacion'] || '',
            observaciones: orden.fields['Observaciones'] || '',
            realizaRegistro: orden.fields['Realiza Registro'] || '',
            productos: [],
            total: 0
          };
        }
      })
    );

    return NextResponse.json({ 
      success: true,
      ordenes: ordenesConProductos,
      total: ordenesConProductos.length
    });

  } catch (error) {
    console.error('❌ [mis-pedidos] Error interno:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
