import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Sprout, Leaf, TestTube } from 'lucide-react';

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
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="bg-white bg-opacity-95 rounded-full p-6 shadow-2xl">
              <Sprout className="h-20 w-20 text-secondary-600" />
            </div>
          </div>
          <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-4 tracking-tight">
            SIRIUS
          </h1>
          <h2 className="text-3xl font-medium text-secondary-300 mb-6 drop-shadow-md">
            Regenerative Solutions
          </h2>
          <p className="text-xl text-white drop-shadow-md max-w-4xl mx-auto mb-10 leading-relaxed">
            Innovación en regeneración de suelos y soluciones ambientales sostenibles. 
            Transformamos tierras degradadas en ecosistemas productivos y saludables.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-secondary-600 to-primary-600 hover:from-secondary-700 hover:to-primary-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-4">
                Acceder al Sistema
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-sirius-dark backdrop-blur-sm text-lg px-8 py-4">
                Registrarse
              </Button>
            </Link>
          </div>
        </div>

        {/* Services Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-white bg-opacity-90 backdrop-blur-sm hover:bg-opacity-95 transition-all duration-300 border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-secondary-100 to-secondary-50 rounded-full p-4">
                  <Leaf className="h-12 w-12 text-secondary-600" />
                </div>
              </div>
              <CardTitle className="text-sirius-dark text-xl">Regeneración de Suelos</CardTitle>
              <CardDescription className="text-base">
                Restauramos la salud del suelo mediante técnicas avanzadas de biorremediación y enmiendas orgánicas especializadas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white bg-opacity-90 backdrop-blur-sm hover:bg-opacity-95 transition-all duration-300 border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-full p-4">
                  <TestTube className="h-12 w-12 text-primary-600" />
                </div>
              </div>
              <CardTitle className="text-sirius-dark text-xl">Análisis de Laboratorio</CardTitle>
              <CardDescription className="text-base">
                Análisis completos de suelo, agua y sedimentos para diagnóstico preciso y monitoreo de la regeneración.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white bg-opacity-90 backdrop-blur-sm hover:bg-opacity-95 transition-all duration-300 border-0 shadow-xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-accent-100 to-accent-50 rounded-full p-4">
                  <Sprout className="h-12 w-12 text-accent-600" />
                </div>
              </div>
              <CardTitle className="text-sirius-dark text-xl">Soluciones Sostenibles</CardTitle>
              <CardDescription className="text-base">
                Desarrollamos estrategias integrales para la recuperación ambiental y la agricultura regenerativa.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Mission Section */}
        <Card className="bg-white bg-opacity-90 backdrop-blur-sm border-0 shadow-2xl">
          <CardContent className="p-10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-sirius-dark mb-8">
                Regenerando el Futuro de Nuestros Suelos
              </h2>
              <p className="text-medical-700 leading-relaxed text-lg mb-8">
                En <span className="font-semibold text-secondary-600">SIRIUS Regenerative Solutions S.A.S ZOMAC</span>, nos especializamos en la 
                restauración de suelos degradados y la implementación de prácticas agrícolas sostenibles. 
                Nuestro laboratorio de vanguardia proporciona análisis precisos para el diagnóstico y 
                seguimiento de proyectos de regeneración ambiental.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <div className="text-3xl font-bold text-secondary-600 mb-2">+500</div>
                  <div className="text-medical-600">Hectáreas Regeneradas</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-primary-600 mb-2">+1000</div>
                  <div className="text-medical-600">Análisis Realizados</div>
                </div>
                <div className="p-4">
                  <div className="text-3xl font-bold text-accent-600 mb-2">15+</div>
                  <div className="text-medical-600">Años de Experiencia</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
