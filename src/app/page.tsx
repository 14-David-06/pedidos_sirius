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

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24">
        {/* Hero Section - Enfoque en productos */}
        <div className="text-center mb-16 sm:mb-24 lg:mb-32">
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-white mb-4 sm:mb-6 tracking-wide leading-tight">
              Sirius Regenerative Solutions
            </h1>
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-green-300 mb-4 sm:mb-6 leading-tight">
              Biochar • Biochar Blend • Microorganismos
            </h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-2 sm:px-0">
              Transformamos la agricultura con soluciones regenerativas de vanguardia. Nuestros productos de biochar y microorganismos especializados mejoran la fertilidad del suelo, incrementan la productividad y capturan carbono de manera sostenible.
            </p>
          </div>
          
          {/* Botones principales - Responsive */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 max-w-4xl mx-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-green-600 bg-opacity-80 backdrop-blur-sm text-white border border-green-400 border-opacity-30 hover:bg-green-500 px-6 sm:px-8 py-4 text-lg font-medium min-h-[56px] transition-all duration-300 hover:scale-105">
                Soy cliente
              </Button>
            </Link>
            <Link href="/cotizacion" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 px-6 sm:px-8 py-4 text-lg font-medium min-h-[56px] transition-all duration-300 hover:scale-105">
                No soy cliente
              </Button>
            </Link>
            <Link href="/registro" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-20 px-6 sm:px-8 py-4 text-lg font-medium min-h-[56px] transition-all duration-300 hover:scale-105">
                Registrar nuevo cliente
              </Button>
            </Link>
          </div>
        </div>

        {/* Sección de Productos */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="bg-black bg-opacity-40 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-white text-center mb-8 sm:mb-10 lg:mb-12">Nuestros Productos</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              <Card className="bg-black bg-opacity-50 backdrop-blur-sm border-green-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white text-xl sm:text-2xl mb-2">Biochar</CardTitle>
                  <CardDescription className="text-green-300 text-base sm:text-lg">Carbón biológico puro</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-gray-200 space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Alta porosidad y superficie específica
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Secuestro permanente de carbono
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Mejora retención de agua y nutrientes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Estabilidad a largo plazo en el suelo
                    </li>
                  </ul>
                  <p className="text-green-300 font-semibold text-center text-sm sm:text-base">Base fundamental para suelos regenerativos</p>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-50 backdrop-blur-sm border-green-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-300 hover:scale-105">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white text-xl sm:text-2xl mb-2">Biochar Blend</CardTitle>
                  <CardDescription className="text-green-300 text-base sm:text-lg">Mezcla especializada</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-gray-200 space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Biochar + nutrientes orgánicos
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Fórmula balanceada para cultivos
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Liberación gradual de nutrientes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Mejora inmediata del suelo
                    </li>
                  </ul>
                  <p className="text-green-300 font-semibold text-center text-sm sm:text-base">Solución completa lista para usar</p>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-50 backdrop-blur-sm border-green-400 border-opacity-50 hover:bg-opacity-60 transition-all duration-300 hover:scale-105 sm:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-white text-xl sm:text-2xl mb-2">Microorganismos</CardTitle>
                  <CardDescription className="text-green-300 text-base sm:text-lg">Biología del suelo</CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <ul className="text-gray-200 space-y-2 sm:space-y-3 mb-4 sm:mb-6 text-sm sm:text-base">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Hongos y bacterias especializados
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Bacterias promotoras de crecimiento
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Mejora absorción de nutrientes
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-1">•</span>
                      Fortalece sistema inmune plantas
                    </li>
                  </ul>
                  <p className="text-green-300 font-semibold text-center text-sm sm:text-base">Vida microbiana para suelos sanos</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Sección de Beneficios */}
        <div className="mb-16 sm:mb-20 lg:mb-24">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-white text-center mb-8 sm:mb-10 lg:mb-12">¿Por qué elegir Biochar Blend?</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
              <div className="text-center">
                <div className="bg-green-600 bg-opacity-20 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl lg:text-3xl">🌱</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-white mb-3 sm:mb-4">Mejora del Suelo</h3>
                <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed">Aumenta la retención de agua y nutrientes, mejorando la estructura del suelo de manera permanente.</p>
              </div>

              <div className="text-center">
                <div className="bg-green-600 bg-opacity-20 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl lg:text-3xl">♻️</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-white mb-3 sm:mb-4">Captura de Carbono</h3>
                <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed">Contribuye significativamente a la captura de carbono atmosférico, ayudando a combatir el cambio climático.</p>
              </div>

              <div className="text-center sm:col-span-2 lg:col-span-1">
                <div className="bg-green-600 bg-opacity-20 rounded-full p-4 sm:p-6 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl lg:text-3xl">📈</span>
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-medium text-white mb-3 sm:mb-4">Mayor Productividad</h3>
                <p className="text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed">Incrementa el rendimiento de cultivos de manera sostenible y natural.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="text-center">
          <div className="bg-black bg-opacity-30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 lg:p-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-4 sm:mb-6 leading-tight">¿Listo para la Agricultura del Futuro?</h2>
            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-2 sm:px-0">
              Únete a la revolución regenerativa con Biochar, Biochar Blend y Microorganismos. 
              Transforma tu suelo, aumenta tu productividad y ayuda al planeta.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 max-w-2xl mx-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium min-h-[48px] transition-all duration-300 hover:scale-105">
                  Acceder al Portal
                </Button>
              </Link>
              <Link href="/registro" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-medium min-h-[48px] transition-all duration-300 hover:scale-105">
                  Registrarse Ahora
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
