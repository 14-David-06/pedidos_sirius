import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Microscope, BeakerIcon, ClipboardListIcon } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full p-4 shadow-xl">
            <Microscope className="h-16 w-16 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-sirius-dark mb-4 tracking-tight">
          SIRIUS
        </h1>
        <h2 className="text-2xl font-medium text-primary-600 mb-4">
          Regenerative Laboratory
        </h2>
        <p className="text-xl text-medical-600 max-w-3xl mx-auto mb-8 leading-relaxed">
          Sistema avanzado de gestión de pedidos para análisis clínicos y medicina regenerativa. 
          Tecnología de vanguardia al servicio de la salud y la regeneración celular.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-lg hover:shadow-xl transition-all duration-200">
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50">
              Crear Cuenta
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <Card className="text-center hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-primary-500">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-primary-100 to-primary-50 rounded-full p-4">
                <BeakerIcon className="h-12 w-12 text-primary-600" />
              </div>
            </div>
            <CardTitle className="text-sirius-dark">Análisis Avanzados</CardTitle>
            <CardDescription>
              Tecnología de última generación para análisis clínicos precisos y confiables en medicina regenerativa
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-secondary-500">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-secondary-100 to-secondary-50 rounded-full p-4">
                <ClipboardListIcon className="h-12 w-12 text-secondary-600" />
              </div>
            </div>
            <CardTitle className="text-sirius-dark">Gestión Eficiente</CardTitle>
            <CardDescription>
              Sistema intuitivo de gestión de pedidos con seguimiento en tiempo real y trazabilidad completa
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="text-center hover:shadow-xl transition-shadow duration-300 border-t-4 border-t-accent-500">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-accent-100 to-accent-50 rounded-full p-4">
                <Microscope className="h-12 w-12 text-accent-600" />
              </div>
            </div>
            <CardTitle className="text-sirius-dark">Medicina Regenerativa</CardTitle>
            <CardDescription>
              Especialistas en terapias regenerativas y tratamientos innovadores para la salud celular
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* About Section */}
      <Card className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 border border-primary-200">
        <CardContent className="p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-sirius-dark mb-6">
              Innovación en Medicina Regenerativa
            </h2>
            <p className="text-medical-700 leading-relaxed text-lg mb-6">
              En <span className="font-semibold text-primary-600">SIRIUS Regenerative Laboratory</span> combinamos ciencia de vanguardia con 
              atención personalizada. Nuestro equipo de especialistas utiliza las 
              tecnologías más avanzadas para ofrecer análisis clínicos precisos y 
              tratamientos de medicina regenerativa que transforman vidas.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-medical-600">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-primary-500 rounded-full mr-2"></div>
                Certificado ISO 15189
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-secondary-500 rounded-full mr-2"></div>
                Tecnología Regenerativa
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-accent-500 rounded-full mr-2"></div>
                Resultados de Excelencia
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
