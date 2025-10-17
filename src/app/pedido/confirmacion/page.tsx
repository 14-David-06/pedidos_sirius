"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, Package, Phone } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get('pdfUrl');

  // Función para descargar el PDF
  const descargarPDF = async () => {
    if (!pdfUrl) return;

    try {
      // Usar el endpoint proxy para evitar problemas de CORS
      const proxyUrl = `/api/download-pdf?url=${encodeURIComponent(pdfUrl)}`;
      window.open(proxyUrl, '_blank');
    } catch (error) {
      console.error('Error al descargar el PDF:', error);
      alert('Error al descargar el archivo. Inténtalo de nuevo.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: 'url(/18032025-DSC_2933.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        <br /><br />
        {/* Confirmación */}
        <Card className="shadow-2xl bg-white bg-opacity-20 backdrop-blur-md border-0">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-800">
              ¡Pedido Enviado Exitosamente!
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start">
                <Package className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-800 mb-2">
                    Tu solicitud ha sido recibida
                  </h4>
                  <p className="text-sm text-green-700">
                    Nuestro equipo comercial se pondrá en contacto contigo en las próximas 24 horas para confirmar los detalles y coordinar la entrega.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Próximos pasos:</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    1
                  </span>
                  <p className="text-sm text-gray-700">
                    Verificación de datos y disponibilidad
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    2
                  </span>
                  <p className="text-sm text-gray-700">
                    Confirmación de precios y condiciones
                  </p>
                </div>
                <div className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    3
                  </span>
                  <p className="text-sm text-gray-700">
                    Coordinación de entrega y facturación
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    ¿Necesitas contactarnos?
                  </h4>
                  <p className="text-sm text-blue-700">
                    📧 adm@siriusregenerative.com
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link href="/">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Volver al Inicio
                </Button>
              </Link>
              
              {pdfUrl && (
                <Button 
                  onClick={descargarPDF}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar Cotización
                </Button>
              )}
              
              <Link href="/mis-pedidos">
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  Ver mis pedidos
                </Button>
              </Link>
              
              <a 
                href="https://sirius-landing.vercel.app/contacto" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50">
                  Contactar Equipo Comercial
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ConfirmacionContent />
    </Suspense>
  );
}
