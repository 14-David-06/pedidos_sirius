import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167074/20032025-DSC_3427_1_1_zmq71m.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section - Enfoque en pedidos */}
        <div className="text-center mb-32">
          <div className="flex justify-center mb-12">
            <img 
              src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
              alt="Sirius Regenerative Lab" 
              className="h-24 w-auto mx-auto"
            />
          </div>
          
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h1 className="text-5xl font-light text-white mb-6 tracking-wide">
              Sirius Regenerative Lab
            </h1>
            
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
              Un sistema ágil, intuitivo y eficiente para que los clientes soliciten sus productos de forma rápida, segura y sin complicaciones.
            </p>
          </div>
          
          <div className="flex justify-center gap-6">
            <Link href="/login">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-gray-800 backdrop-blur-sm px-8 py-4 text-lg font-medium">
                Iniciar Sesión
              </Button>
            </Link>
            <Link href="/catalogo">
              <Button size="lg" className="bg-white bg-opacity-20 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-opacity-30 px-8 py-4 text-lg font-medium">
                Registrarme
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}