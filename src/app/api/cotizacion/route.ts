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
  microorganismos: [
    { id: 'TR', nombre: 'Trichoderma harzianum', tipo: 'Hongo', codigo: 'TR', unidad: 'litros', precio: 38000 },
    { id: 'MT', nombre: 'Metarhizium anisopliae', tipo: 'Hongo', codigo: 'MT', unidad: 'litros', precio: 38000 },
    { id: 'PL', nombre: 'Purpureocillium lilacinum', tipo: 'Hongo', codigo: 'PL', unidad: 'litros', precio: 38000 },
    { id: 'BV', nombre: 'Beauveria bassiana', tipo: 'Hongo', codigo: 'BV', unidad: 'litros', precio: 38000 },
    { id: 'BT', nombre: 'Bacillus thuringiensis', tipo: 'Bacteria', codigo: 'BT', unidad: 'litros', precio: 38000 },
    { id: 'SB', nombre: 'Siriusbacter', tipo: 'Bacteria', codigo: 'SB', unidad: 'litros', precio: 38000 }
  ],
  biochar: [
    { id: 'BB', nombre: 'Biochar Blend', tipo: 'Biochar', codigo: 'BB', unidad: 'kg', precio: 1190 },
    { id: 'BC', nombre: 'Biochar', tipo: 'Biochar', codigo: 'BC', unidad: 'kg', precio: 2000 }
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
  console.log('📄 INICIANDO GENERACIÓN DE PDF EN SERVIDOR');

  // Crear instancia de jsPDF
  const pdf = new jsPDF();

  // Configuración de colores y fuentes
  const primaryColor: [number, number, number] = [34, 197, 94]; // emerald-500
  const secondaryColor: [number, number, number] = [107, 114, 128]; // gray-500

  // Header
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.rect(0, 0, 210, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.text('SIRIUS REGENERATIVE SOLUTIONS', 20, 20);

  pdf.setFontSize(14);
  pdf.text('Cotización de Productos', 20, 32);

  // Fecha
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(10);
  const fecha = new Date().toLocaleDateString('es-CO');
  pdf.text(`Fecha: ${fecha}`, 150, 50);

  // Información del cliente
  let yPosition = 70;
  if (datosContacto.nombre) {
    pdf.setFontSize(12);
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Información del Cliente:', 20, yPosition);
    yPosition += 10;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text(`Nombre: ${datosContacto.nombre}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Empresa: ${datosContacto.empresa}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Teléfono: ${datosContacto.telefono}`, 20, yPosition);
    yPosition += 8;
    pdf.text(`Correo: ${datosContacto.correo}`, 20, yPosition);
    yPosition += 15;
  }

  // Crear tabla manualmente
  const startY = yPosition;
  const rowHeight = 12;
  const colWidths = [15, 60, 25, 25, 35, 30];
  const tableWidth = colWidths.reduce((sum, width) => sum + width, 0);

  // Header de tabla
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(10);

  let currentX = 20;
  const headers = ['#', 'Producto', 'Código', 'Cantidad', 'Precio Unit.', 'Subtotal'];

  headers.forEach((header, index) => {
    pdf.rect(currentX, startY, colWidths[index], rowHeight, 'F');
    pdf.text(header, currentX + 2, startY + 8);
    currentX += colWidths[index];
  });

  // Filas de datos
  pdf.setTextColor(0, 0, 0);
  pdf.setFontSize(9);

  let currentY = startY + rowHeight;
  productosSeleccionados.forEach((item, index) => {
    const producto = getProductoInfo(item.categoria, item.productoId);
    if (!producto) return;

    const subtotal = calcularSubtotal(producto, item.cantidad);
    const rowData = [
      (index + 1).toString(),
      producto.nombre.length > 25 ? producto.nombre.substring(0, 22) + '...' : producto.nombre,
      producto.codigo,
      `${item.cantidad} ${producto.unidad}`,
      formatearPrecio(producto.precio),
      formatearPrecio(subtotal)
    ];

    currentX = 20;
    rowData.forEach((data, colIndex) => {
      // Dibujar borde de celda
      pdf.rect(currentX, currentY, colWidths[colIndex], rowHeight);

      // Agregar texto
      const textX = currentX + 2;
      const textY = currentY + 8;

      // Ajustar texto largo
      let displayText = data;
      const maxWidth = colWidths[colIndex] - 4;
      if (pdf.getTextWidth(displayText) > maxWidth) {
        while (pdf.getTextWidth(displayText + '...') > maxWidth && displayText.length > 3) {
          displayText = displayText.substring(0, displayText.length - 1);
        }
        displayText += '...';
      }

      pdf.text(displayText, textX, textY);
      currentX += colWidths[colIndex];
    });

    currentY += rowHeight;
  });

  // Total
  const finalY = currentY + 20;
  const total = calcularTotal(productosSeleccionados);

  pdf.setFontSize(14);
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  pdf.text('TOTAL:', 140, finalY);

  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text(formatearPrecio(total), 170, finalY);

  // Footer
  const pageHeight = pdf.internal.pageSize.height;
  pdf.setFontSize(8);
  pdf.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  pdf.text('Sirius Regenerative Solutions - Cotización generada automáticamente', 20, pageHeight - 20);
  pdf.text('www.siriusregenerative.co', 20, pageHeight - 10);

  // Retornar el PDF como buffer
  const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
  console.log('✅ PDF generado exitosamente en servidor, tamaño:', pdfBuffer.length, 'bytes');

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