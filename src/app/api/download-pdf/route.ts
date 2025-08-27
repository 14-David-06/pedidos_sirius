import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

// Configuración de AWS S3 - Server-side
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export async function GET(request: NextRequest) {
  console.log('📥 INICIANDO DESCARGA DE PDF PROXY');

  try {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get('url');

    if (!pdfUrl) {
      return NextResponse.json({ error: 'URL del PDF requerida' }, { status: 400 });
    }

    // Extraer el nombre del archivo de la URL
    const fileName = pdfUrl.split('/').pop() || 'cotizacion.pdf';

    // Extraer el nombre del bucket y la key del archivo
    const urlParts = pdfUrl.replace('https://', '').split('/');
    const bucketName = urlParts[0].split('.')[0];
    const key = urlParts.slice(1).join('/');

    console.log('📋 Parámetros de descarga:', {
      bucketName,
      key,
      fileName
    });

    // Obtener el archivo desde S3
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    });

    const response = await s3Client.send(command);

    if (!response.Body) {
      throw new Error('No se pudo obtener el archivo desde S3');
    }

    // Convertir el stream a buffer
    const buffer = Buffer.from(await response.Body.transformToByteArray());

    console.log('✅ Archivo obtenido exitosamente desde S3, tamaño:', buffer.length, 'bytes');

    // Devolver el archivo con headers apropiados para descarga
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': buffer.length.toString(),
      },
    });

  } catch (error: any) {
    console.error('💥 ERROR EN DESCARGA PROXY:', error);
    return NextResponse.json({
      error: 'Error al descargar el archivo',
      details: error.message
    }, { status: 500 });
  }
}
