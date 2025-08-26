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
        {/* Hero Section - Enfoque en productos */}
        <div className="text-center mb-32">
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h1 className="text-5xl font-light text-white mb-6 tracking-wide">
              Sirius Regenerative Solutions
            </h1>
            <h2 className="text-3xl font-bold text-green-300 mb-6">
              Biochar • Biochar Blend • Microorganismos
            </h2>
            <p className="text-xl text-white mb-8 max-w-4xl mx-auto leading-relaxed">
              Transformamos la agricultura con soluciones regenerativas de vanguardia. Nuestros productos de biochar y microorganismos especializados mejoran la fertilidad del suelo, incrementan la productividad y capturan carbono de manera sostenible.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Link href="/login">
              <Button size="lg" className="bg-green-600 bg-opacity-80 backdrop-blur-sm text-white border border-green-400 border-opacity-30 hover:bg-green-500 px-8 py-4 text-lg font-medium">
                Soy cliente
              </Button>
            </Link>
            <Link href="/cotizacion">
              <Button size="lg" variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 px-8 py-4 text-lg font-medium">
                No soy cliente
              </Button>
            </Link>
            <Link href="/registro">
              <Button size="lg" variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 px-8 py-4 text-lg font-medium">
                Registrar nuevo cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="mb-24">
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-8 mb-12">
            <h2 className="text-4xl font-light text-white text-center mb-12">Nuestros Productos</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-black bg-opacity-50 backdrop-blur-sm border-green-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-2xl mb-2">Biochar</CardTitle>
                  <CardDescription className="text-green-300 text-lg">Carbón biológico puro</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-gray-200 space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Alta porosidad y superficie específica
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Secuestro permanente de carbono
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Mejora retención de agua y nutrientes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Estabilidad a largo plazo en el suelo
                    </li>
                  </ul>
                  <p className="text-green-300 font-semibold text-center">Base fundamental para suelos regenerativos</p>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-50 backdrop-blur-sm border-green-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-2xl mb-2">Biochar Blend</CardTitle>
                  <CardDescription className="text-green-300 text-lg">Mezcla especializada</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-gray-200 space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Biochar + nutrientes orgánicos
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Fórmula balanceada para cultivos
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Liberación gradual de nutrientes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Mejora inmediata del suelo
                    </li>
                  </ul>
                  <p className="text-green-300 font-semibold text-center">Solución completa lista para usar</p>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-50 backdrop-blur-sm border-green-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="text-white text-2xl mb-2">Microorganismos</CardTitle>
                  <CardDescription className="text-green-300 text-lg">Biología del suelo</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-gray-200 space-y-3 mb-6">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Hongos y bacterias especializados
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Bacterias promotoras de crecimiento
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Mejora absorción de nutrientes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      Fortalece sistema inmune plantas
                    </li>
                  </ul>
                  <p className="text-green-300 font-semibold text-center">Vida microbiana para suelos sanos</p>
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

        {/* Call to Action Final */}
        <div className="text-center">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-8">
            <h2 className="text-4xl font-light text-white mb-6">¿Listo para la Agricultura del Futuro?</h2>
            <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Únete a la revolución regenerativa con Biochar, Biochar Blend y Microorganismos. 
              Transforma tu suelo, aumenta tu productividad y ayuda al planeta.
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4">
                Acceder al Portal
              </Button>
              <Button size="lg" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-4">
                Registrarse Ahora
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
