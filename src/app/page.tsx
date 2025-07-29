'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <div className="min-h-screen relative">
      {/* Video Background Container */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Error cargando video:', e);
            // Si hay error, ocultar el video y mostrar el fallback
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src="https://res.cloudinary.com/dvnuttrox/video/upload/v1753725540/corte_productos_pitch_deck_-_Made_with_Clipchamp_kbfied.mp4" type="video/mp4" />
        </video>
        
        {/* Fallback background image si el video no carga */}
        <div 
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167074/20032025-DSC_3427_1_1_zmq71m.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -1
          }}
        />
      </div>

      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24">
        {/* Hero Section - Enfoque en pedidos */}
        <div className="text-center mb-32">
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h1 className="text-5xl font-light text-white mb-6 tracking-wide">
              Sirius Regenerative Solutions S.A.S ZOMAC
            </h1>
            <h2 className="text-2xl font-bold text-white mb-6">
              Biochar Blend
            </h2>
            <p className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
              Plataforma especializada para pedidos de Biochar Blend. Solución ecológica y regenerativa que mejora la fertilidad del suelo y captura carbono de manera sostenible.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/pedido">
              <Button size="lg" className="bg-green-600 bg-opacity-80 backdrop-blur-sm text-white border border-green-400 border-opacity-30 hover:bg-green-500 px-8 py-4 text-lg font-medium">
                Solicitar Biochar Blend
              </Button>
            </Link>
            <Link href="/mis-pedidos">
              <Button size="lg" variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 px-8 py-4 text-lg font-medium">
                Ver mis pedidos
              </Button>
            </Link>
          </div>
        </div>

        {/* Sección de Presentaciones */}
        <div className="mb-24">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h2 className="text-4xl font-light text-white text-center mb-12">Presentaciones Disponibles</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white bg-opacity-16 backdrop-blur-sm border-green-400 border-opacity-30">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">BigBag</CardTitle>
                  <CardDescription className="text-gray-200">1000kg (1 tonelada)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-white space-y-2 mb-4">
                    <li>• Ideal para proyectos grandes</li>
                    <li>• Excelente relación precio-volumen</li>
                    <li>• Óptimo para distribución uniforme</li>
                  </ul>
                  <p className="text-green-300 font-medium">Perfecto para extensiones medianas y grandes</p>
                </CardContent>
              </Card>

              <Card className="bg-white bg-opacity-16 backdrop-blur-sm border-green-400 border-opacity-30">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">Bulto</CardTitle>
                  <CardDescription className="text-gray-200">50kg</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-white space-y-2 mb-4">
                    <li>• Fácil manejo y aplicación</li>
                    <li>• Ideal para jardines y cultivos pequeños</li>
                    <li>• Almacenamiento conveniente</li>
                  </ul>
                  <p className="text-green-300 font-medium">Ideal para huertos familiares y proyectos menores</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sección de Beneficios */}
        <div className="mb-24">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-4xl font-light text-white text-center mb-12">¿Por qué elegir Biochar Blend?</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-green-600 bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-4">Mejora del Suelo</h3>
                <p className="text-gray-200">Aumenta la retención de agua y nutrientes, mejorando la estructura del suelo de manera permanente.</p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">♻️</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-4">Captura de Carbono</h3>
                <p className="text-gray-200">Contribuye significativamente a la captura de carbono atmosférico, ayudando a combatir el cambio climático.</p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 bg-opacity-20 rounded-full p-6 w-24 h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-medium text-white mb-4">Mayor Productividad</h3>
                <p className="text-gray-200">Incrementa el rendimiento de cultivos de manera sostenible y natural.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Información de la empresa */}
        <div className="mb-24">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-4xl font-light text-white text-center mb-8">Sobre Sirius</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-200 mb-6">
                Somos una empresa especializada en soluciones regenerativas para la agricultura sostenible. 
                Nuestro Biochar Blend representa la vanguardia en tecnología de carbono biológico.
              </p>
              <p className="text-lg text-gray-200">
                Con más de años de experiencia en investigación y desarrollo, ofrecemos productos 
                que no solo mejoran la productividad agrícola, sino que también contribuyen 
                positivamente al medio ambiente.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center">
          <div className="bg-green-600 bg-opacity-20 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-3xl font-light text-white mb-6">¿Listo para transformar tu suelo?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Únete a la revolución regenerativa y experimenta los beneficios del Biochar Blend en tus cultivos.
            </p>
            <Link href="/pedido">
              <Button size="lg" className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 text-lg font-medium">
                Hacer Pedido Ahora
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
