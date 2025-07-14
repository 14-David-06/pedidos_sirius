import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, Package, Phone } from 'lucide-react';

export default function ConfirmacionPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167074/20032025-DSC_3427_1_1_zmq71m.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
              alt="Sirius Logo" 
              className="h-16 w-auto"
            />
          </div>
        </div>

        {/* Confirmación */}
        <Card className="shadow-2xl bg-white bg-opacity-95 backdrop-blur-sm border-0">
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
                    📧 pedidos@siriusregenerative.com<br />
                    📞 +57 (300) 123-4567
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
