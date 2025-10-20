import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import Airtable from 'airtable';
import jsPDF from 'jspdf';

// Configuración de AWS S3 - Server-side
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Configuración de Airtable - Server-side
const airtableBase = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY || '',
}).base(process.env.AIRTABLE_BASE_ID || '');

interface ProductoSeleccionado {
  id: string;
  categoria: string;
  productoId: string;
  cantidad: number;
}

interface DatosContacto {
  nombre: string;
  telefono: string;
  empresa: string;
  correo: string;
  aceptaPolitica: boolean;
}

const productos = {
  biofertilizantes: [
    { 
      id: 'SD', 
      nombre: 'Start Dust', 
      tipo: 'Biochar', 
      codigo: 'SD', 
      unidad: 'kg', 
      precio: 38000,
      descripcion: 'Carbón vegetal activado con tecnología de pirolisis avanzada, enriquecido con consorcios microbianos específicos.',
      categoria: 'Biofertilizante'
    },
    { 
      id: 'TC', 
      nombre: 'Tricochar', 
      tipo: 'Biochar', 
      codigo: 'TC', 
      unidad: 'kg', 
      precio: 2500,
      descripcion: 'Matriz de carbón bioactivado inoculado con cepas seleccionadas de Trichoderma harzianum.',
      categoria: 'Biofertilizante'
    },
    { 
      id: 'BB', 
      nombre: 'Biochar Blend', 
      tipo: 'Biochar', 
      codigo: 'BB', 
      unidad: 'kg', 
      precio: 1190,
      descripcion: 'Mezcla especializada de Biochar, BioAbono y microorganismos beneficiosos para optimización del suelo.',
      categoria: 'Biofertilizante'
    }
  ],
  biocontroladores: [
    { 
      id: 'TR', 
      nombre: 'Trichoderma Harzianum', 
      tipo: 'Hongo', 
      codigo: 'TR', 
      unidad: 'litros', 
      precio: 38000,
      descripcion: 'Cepa élite de hongo filamentoso con actividad micoparasítica contra patógenos del suelo.',
      categoria: 'Biocontrolador'
    },
    { 
      id: 'MT', 
      nombre: 'Metarhizium Anisopliae', 
      tipo: 'Hongo', 
      codigo: 'MT', 
      unidad: 'litros', 
      precio: 38000,
      descripcion: 'Hongo entomopatógeno especializado en control biológico de insectos plaga.',
      categoria: 'Biocontrolador'
    },
    { 
      id: 'PL', 
      nombre: 'Purpureocillium lilacinum', 
      tipo: 'Hongo', 
      codigo: 'PL', 
      unidad: 'litros', 
      precio: 38000,
      descripcion: 'Agente de biocontrol eficaz contra nematodos fitopatógenos.',
      categoria: 'Biocontrolador'
    },
    { 
      id: 'BV', 
      nombre: 'Beauveria Bassiana', 
      tipo: 'Hongo', 
      codigo: 'BV', 
      unidad: 'litros', 
      precio: 38000,
      descripcion: 'Hongo entomopatógeno de amplio espectro para control de hemípteros y tisanópteros.',
      categoria: 'Biocontrolador'
    },
    { 
      id: 'BT', 
      nombre: 'Bacillus thuringiensis', 
      tipo: 'Bacteria', 
      codigo: 'BT', 
      unidad: 'litros', 
      precio: 38000,
      descripcion: 'Bacteria productora de δ-endotoxinas con actividad específica contra lepidópteros.',
      categoria: 'Biocontrolador'
    },
    { 
      id: 'SB', 
      nombre: 'SiriusBacter', 
      tipo: 'Bacteria', 
      codigo: 'SB', 
      unidad: 'litros', 
      precio: 38000,
      descripcion: 'Consorcio de rizobacterias promotoras del crecimiento vegetal (PGPR).',
      categoria: 'Biofertilizante'
    }
  ]
};

// Función para calcular el subtotal de un producto
const calcularSubtotal = (producto: any, cantidad: number) => {
  return producto.precio * cantidad;
};

// Función para calcular el total general
const calcularTotal = (productosSeleccionados: ProductoSeleccionado[]) => {
  return productosSeleccionados.reduce((total, item) => {
    const producto = getProductoInfo(item.categoria, item.productoId);
    if (producto) {
      return total + calcularSubtotal(producto, item.cantidad);
    }
    return total;
  }, 0);
};

// Función para formatear precios
const formatearPrecio = (precio: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
};

// Función para generar y retornar PDF como buffer
const generarPDFBuffer = (productosSeleccionados: ProductoSeleccionado[], datosContacto: DatosContacto): Buffer => {
  console.log('📄 INICIANDO GENERACIÓN DE PDF PROFESIONAL EN SERVIDOR');

  // Crear instancia de jsPDF con configuración A4
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Configuración de colores profesionales
  const primaryColor: [number, number, number] = [22, 163, 74]; // green-600
  const secondaryColor: [number, number, number] = [75, 85, 99]; // gray-600
  const accentColor: [number, number, number] = [249, 115, 22]; // orange-500
  const backgroundColor: [number, number, number] = [248, 250, 252]; // slate-50

  // === HEADER PROFESIONAL ===
  // Fondo del header con gradiente simulado
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, 210, 45, 'F');

  // Logo y título principal
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(28);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SIRIUS', 20, 22);
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('REGENERATIVE SOLUTIONS', 20, 32);

  // Subtítulo elegante
  pdf.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.rect(20, 38, 100, 4, 'F');
  
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('COTIZACIÓN COMERCIAL', 130, 25);

  // Número de cotización y fecha
  const numeroCotizacion = `COT-${Date.now().toString().slice(-6)}`;
  const fecha = new Date();
  const fechaFormatted = fecha.toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`No. ${numeroCotizacion}`, 130, 32);
  pdf.text(`${fechaFormatted}`, 130, 38);

  // === INFORMACIÓN DEL CLIENTE (SECCIÓN ELEGANTE) ===
  let yPos = 60;

  // Caja de información del cliente
  pdf.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  pdf.rect(20, yPos, 170, 35, 'F');
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.5);
  pdf.rect(20, yPos, 170, 35, 'S');

  // Título de la sección
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('INFORMACIÓN DEL CLIENTE', 25, yPos + 8);

  // Información en dos columnas
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');

  const clienteInfo = [
    ['Cliente:', datosContacto.nombre],
    ['Empresa:', datosContacto.empresa],
    ['Teléfono:', datosContacto.telefono],
    ['Email:', datosContacto.correo]
  ];

  clienteInfo.forEach((info, index) => {
    const x = 25;
    const y = yPos + 15 + (index * 5);
    
    pdf.setFont('helvetica', 'bold');
    pdf.text(info[0], x, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(info[1], x + 20, y);
  });

  yPos += 45;

  // === TABLA DE PRODUCTOS PROFESIONAL ===
  yPos += 10;

  // Título de la tabla
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('DETALLE DE PRODUCTOS', 20, yPos);

  yPos += 10;

  // Configuración de la tabla
  const tableStartY = yPos;
  const rowHeight = 14;
  const headerHeight = 16;
  const colWidths = [15, 70, 20, 25, 30, 30]; // Ajustado para mejor distribución
  
  // Header de la tabla con estilo profesional
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(20, tableStartY, 190, headerHeight, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');

  const headers = ['#', 'Producto', 'Cód.', 'Cantidad', 'Precio Unit.', 'Subtotal'];
  let currentX = 20;

  headers.forEach((header, index) => {
    const textWidth = pdf.getTextWidth(header);
    const centerX = currentX + (colWidths[index] - textWidth) / 2;
    pdf.text(header, centerX, tableStartY + 11);
    currentX += colWidths[index];
  });

  // Filas de datos con alternancia de colores
  let currentY = tableStartY + headerHeight;
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);

  productosSeleccionados.forEach((item, index) => {
    const producto = getProductoInfo(item.categoria, item.productoId);
    if (!producto) return;

    // Alternar color de fondo para las filas
    if (index % 2 === 1) {
      pdf.setFillColor(248, 250, 252); // slate-50
      pdf.rect(20, currentY, 190, rowHeight, 'F');
    }

    const subtotal = calcularSubtotal(producto, item.cantidad);
    
    // Datos de la fila
    const rowData = [
      (index + 1).toString(),
      producto.nombre,
      producto.codigo,
      `${item.cantidad} ${producto.unidad}`,
      formatearPrecio(producto.precio),
      formatearPrecio(subtotal)
    ];

    currentX = 20;
    rowData.forEach((data, colIndex) => {
      // Bordes de celda sutiles
      pdf.setDrawColor(200, 200, 200);
      pdf.setLineWidth(0.1);
      pdf.rect(currentX, currentY, colWidths[colIndex], rowHeight, 'S');

      // Texto centrado o alineado según la columna
      let textX = currentX + 2;
      let displayText = data;

      // Truncar texto si es muy largo
      const maxWidth = colWidths[colIndex] - 4;
      if (pdf.getTextWidth(displayText) > maxWidth) {
        while (pdf.getTextWidth(displayText + '...') > maxWidth && displayText.length > 3) {
          displayText = displayText.substring(0, displayText.length - 1);
        }
        displayText += '...';
      }

      // Alinear números a la derecha (precios)
      if (colIndex >= 3) {
        const textWidth = pdf.getTextWidth(displayText);
        textX = currentX + colWidths[colIndex] - textWidth - 2;
      }

      pdf.setFont('helvetica', colIndex === 1 ? 'bold' : 'normal');
      pdf.text(displayText, textX, currentY + 9);
      currentX += colWidths[colIndex];
    });

    currentY += rowHeight;
  });

  // === TOTALES PROFESIONALES ===
  const totalY = currentY + 15;
  const total = calcularTotal(productosSeleccionados);

  // Caja para totales
  pdf.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
  pdf.rect(130, totalY, 80, 25, 'F');
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(0.8);
  pdf.rect(130, totalY, 80, 25, 'S');

  // Subtotal (opcional, por ahora igual al total)
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', 135, totalY + 8);
  pdf.text(formatearPrecio(total), 175, totalY + 8);

  // Total principal
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TOTAL:', 135, totalY + 18);
  
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(formatearPrecio(total), 175, totalY + 18);

  // === TÉRMINOS Y CONDICIONES ===
  const termsY = totalY + 40;
  
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TÉRMINOS Y CONDICIONES', 20, termsY);

  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');

  const terminos = [
    '• Esta cotización tiene validez de 30 días calendario.',
    '• Los precios incluyen IVA y están sujetos a cambios sin previo aviso.',
    '• Tiempo de entrega: 5-10 días hábiles una vez confirmado el pedido.',
    '• Productos biotecnológicos de alta calidad con certificación de calidad.',
    '• Garantía técnica y soporte especializado incluido.'
  ];

  terminos.forEach((termino, index) => {
    pdf.text(termino, 20, termsY + 8 + (index * 4));
  });

  // === FOOTER PROFESIONAL ===
  const pageHeight = pdf.internal.pageSize.height;
  
  // Línea separadora
  pdf.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setLineWidth(1);
  pdf.line(20, pageHeight - 30, 190, pageHeight - 30);

  // Información de contacto
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('SIRIUS REGENERATIVE SOLUTIONS', 20, pageHeight - 22);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Email: contacto@siriusregenerative.co | Web: www.siriusregenerative.co', 20, pageHeight - 18);
  pdf.text('Soluciones biotecnológicas para agricultura sostenible', 20, pageHeight - 14);

  // Fecha y página
  pdf.text(`Generado el ${fechaFormatted}`, 20, pageHeight - 8);
  pdf.text('Página 1 de 1', 170, pageHeight - 8);

  // === MARCA DE AGUA SUTIL ===
  pdf.setTextColor(240, 240, 240);
  pdf.setFontSize(60);
  pdf.setFont('helvetica', 'bold');
  
  // Guardar estado actual
  pdf.saveGraphicsState();
  
  // Aplicar rotación y transparencia simulada
  const centerX = 105;
  const centerY = 148;
  
  pdf.text('SIRIUS', centerX - 30, centerY, { angle: 45 });
  
  // Restaurar estado
  pdf.restoreGraphicsState();

  // Retornar el PDF como buffer
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  console.log('✅ PDF PROFESIONAL generado exitosamente en servidor, tamaño:', pdfBuffer.length, 'bytes');

  return pdfBuffer;
};

// Función para subir PDF a S3
const subirPDFaS3 = async (pdfBuffer: Buffer, nombreCliente: string): Promise<string> => {
  console.log('🔧 INICIANDO SUBIDA A S3 EN SERVIDOR');

  const fechaActual = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const nombreArchivo = `${nombreCliente}_${fechaActual}_cotizacion.pdf`;
  console.log('📁 Nombre de archivo generado:', nombreArchivo);

  // Validar variables de entorno requeridas para S3
  const requiredS3EnvVars = [
    'AWS_S3_BUCKET_NAME',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];
  for (const envVar of requiredS3EnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variable de entorno faltante para S3: ${envVar}`);
    }
  }

  try {
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: nombreArchivo,
      Body: pdfBuffer,
      ContentType: 'application/pdf',
    };

    console.log('📋 Parámetros de subida:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      BodyLength: uploadParams.Body.length
    });

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    console.log('✅ Archivo subido exitosamente a S3');

    const finalUrl = `https://${uploadParams.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${nombreArchivo}`;
    console.log('🎯 URL final del archivo:', finalUrl);

    return finalUrl;

  } catch (error: any) {
    console.error('💥 ERROR EN SUBIDA S3:', error);
    throw new Error(`Error al subir archivo a S3: ${error?.message || 'Error desconocido'}`);
  }
};

// Función para crear registro en Airtable
const crearRegistroAirtable = async (datosContacto: DatosContacto, pdfUrl: string, pdfBuffer: Buffer): Promise<void> => {
  console.log('📊 INICIANDO CREACIÓN DE REGISTRO EN AIRTABLE');

  // Validar variables de entorno requeridas
  const requiredEnvVars = [
    'AIRTABLE_API_KEY',
    'AIRTABLE_BASE_ID',
    'COTIZACIONES_PAGINA_TABLE_ID',
    'COTIZACIONES_NOMBRE_COTIZANTE_FIELD_ID',
    'COTIZACIONES_NUMERO_CONTACTO_FIELD_ID',
    'COTIZACIONES_NOMBRE_EMPRESA_FIELD_ID',
    'COTIZACIONES_EMAIL_FIELD_ID',
    'COTIZACIONES_DOCUMENTO_FIELD_ID'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Variable de entorno faltante: ${envVar}`);
    }
  }

  // Debug: Check environment variables
  console.log('🔧 Variables de entorno Airtable:', {
    AIRTABLE_API_KEY: process.env.AIRTABLE_API_KEY ? 'PRESENTE' : 'FALTANTE',
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    COTIZACIONES_PAGINA_TABLE_ID: process.env.COTIZACIONES_PAGINA_TABLE_ID,
    fieldIds: {
      nombre: process.env.COTIZACIONES_NOMBRE_COTIZANTE_FIELD_ID,
      telefono: process.env.COTIZACIONES_NUMERO_CONTACTO_FIELD_ID,
      empresa: process.env.COTIZACIONES_NOMBRE_EMPRESA_FIELD_ID,
      correo: process.env.COTIZACIONES_EMAIL_FIELD_ID,
      documento: process.env.COTIZACIONES_DOCUMENTO_FIELD_ID
    }
  });

  try {
    const recordData = {
      fields: {
        [process.env.COTIZACIONES_NOMBRE_COTIZANTE_FIELD_ID!]: datosContacto.nombre,
        [process.env.COTIZACIONES_NUMERO_CONTACTO_FIELD_ID!]: datosContacto.telefono,
        [process.env.COTIZACIONES_NOMBRE_EMPRESA_FIELD_ID!]: datosContacto.empresa,
        [process.env.COTIZACIONES_EMAIL_FIELD_ID!]: datosContacto.correo,
        [process.env.COTIZACIONES_DOCUMENTO_FIELD_ID!]: [
          {
            url: pdfUrl,
            filename: pdfUrl.split('/').pop() || 'cotizacion.pdf'
          } as any // Type assertion to bypass strict typing for new attachments
        ]
      }
    };

    console.log('📋 Datos a enviar a Airtable:', recordData);

    const result = await airtableBase(process.env.COTIZACIONES_PAGINA_TABLE_ID!).create([recordData]);
    console.log('✅ Registro creado exitosamente en Airtable:', result);

  } catch (error: any) {
    console.error('💥 ERROR DETALLADO EN AIRTABLE:', error);
    console.error('🔍 Tipo de error:', error?.constructor?.name || 'Unknown');
    console.error('📋 Mensaje de error:', error?.message || 'No message');
    console.error('🔍 Código de error:', error?.statusCode || 'No status code');
    console.error('🔍 Respuesta completa:', error?.response?.data || 'No response data');

    if (error?.stack) {
      console.error('📚 Stack trace:', error.stack);
    }

    throw new Error('Error al guardar la información en la base de datos');
  }
};

const getProductoInfo = (categoria: string, productoId: string) => {
  if (!categoria || !productoId) return null;
  return productos[categoria as keyof typeof productos]?.find((p: any) => p.id === productoId);
};

export async function POST(request: NextRequest) {
  console.log('🚀 INICIANDO PROCESO DE COTIZACIÓN EN SERVIDOR');

  try {
    const { productosSeleccionados, datosContacto }: { productosSeleccionados: ProductoSeleccionado[], datosContacto: DatosContacto } = await request.json();

    console.log('📋 Datos recibidos:', { productosSeleccionados, datosContacto });

    // Validación
    if (!datosContacto.nombre || !datosContacto.telefono || !datosContacto.empresa ||
        !datosContacto.correo || !datosContacto.aceptaPolitica) {
      throw new Error('Por favor completa todos los campos y acepta la política de privacidad');
    }

    if (!productosSeleccionados || productosSeleccionados.length === 0) {
      throw new Error('No hay productos seleccionados');
    }

    console.log('📄 PASO 1: Generando PDF...');
    const pdfBuffer = generarPDFBuffer(productosSeleccionados, datosContacto);

    console.log('☁️ PASO 2: Subiendo PDF a S3...');
    const pdfUrl = await subirPDFaS3(pdfBuffer, datosContacto.nombre.replace(/\s+/g, '_'));

    console.log('📊 PASO 3: Creando registro en Airtable...');
    await crearRegistroAirtable(datosContacto, pdfUrl, pdfBuffer);

    console.log('🎉 PROCESO COMPLETADO EXITOSAMENTE');

    return NextResponse.json({
      success: true,
      message: 'Cotización enviada exitosamente',
      pdfUrl: pdfUrl
    });

  } catch (error: any) {
    console.error('💥 ERROR EN PROCESO DE COTIZACIÓN:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}