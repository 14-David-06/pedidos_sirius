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
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h1 className="text-5xl font-light text-white mb-6 tracking-wide">
              Sirius Regenerative Solutions S.A.S ZOMAC
            </h1>
            <h2 className="text-2xl font-light text-green-300 mb-6">
              Biochar Blend
            </h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
              Plataforma especializada para pedidos de Biochar Blend. Solución ecológica y regenerativa que mejora la fertilidad del suelo y captura carbono de manera sostenible.
            </p>
          </div>
          
          <div className="flex justify-center">
            <Link href="/pedido">
              <Button size="lg" className="bg-green-600 bg-opacity-80 backdrop-blur-sm text-white border border-green-400 border-opacity-30 hover:bg-green-500 px-8 py-4 text-lg font-medium">
                Solicitar Biochar Blend
              </Button>
            </Link>
          </div>
        </div>

        {/* Sección de Presentaciones */}
        <div className="mb-24">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h2 className="text-4xl font-light text-white text-center mb-12">Presentaciones Disponibles</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-green-400 border-opacity-30">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">BigBag</CardTitle>
                  <CardDescription className="text-green-300">Presentación industrial para grandes volúmenes</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-4">Ideal para proyectos de gran escala, agricultura extensiva y restauración de suelos degradados.</p>
                  <ul className="text-green-200 space-y-2">
                    <li>• Capacidad: 500-1000 kg</li>
                    <li>• Fácil manejo con maquinaria</li>
                    <li>• Óptimo para distribución uniforme</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-white bg-opacity-10 backdrop-blur-sm border-green-400 border-opacity-30">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Lona</CardTitle>
                  <CardDescription className="text-green-300">Presentación estándar para proyectos medianos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-white mb-4">Perfecto para jardines, huertos urbanos y proyectos de mediana escala.</p>
                  <ul className="text-green-200 space-y-2">
                    <li>• Capacidad: 25-50 kg</li>
                    <li>• Manejo manual cómodo</li>
                    <li>• Ideal para aplicaciones específicas</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sección de Beneficios */}
        <div className="mb-24">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-4xl font-light text-white text-center mb-12">Beneficios del Biochar Blend</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Mejora la Fertilidad</h3>
                <p className="text-green-200">Incrementa la retención de nutrientes y mejora la estructura del suelo de manera sostenible.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-2xl">💧</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Retención de Agua</h3>
                <p className="text-green-200">Aumenta significativamente la capacidad de retención hídrica del suelo.</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-green-400 text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">Captura de Carbono</h3>
                <p className="text-green-200">Contribuye activamente a la mitigación del cambio climático capturando CO₂ atmosférico.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-800 bg-opacity-80 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-light text-white mb-6">¿Listo para regenerar tu suelo?</h2>
            <p className="text-green-100 mb-8 text-lg">Únete a la revolución regenerativa con Biochar Blend</p>
            
            <div className="flex justify-center">
              <Link href="/pedido">
                <Button size="lg" className="bg-white text-green-800 hover:bg-green-100 px-8 py-4 text-lg font-medium">
                  Realizar Pedido
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}