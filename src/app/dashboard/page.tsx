'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  FlaskConical, 
  Leaf, 
  ClipboardList,
  Calendar
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div 
        className="min-h-screen py-12 relative"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Espaciado superior para el navbar */}
          <div className="pt-20 mb-8">
            {/* Header del Dashboard con recuadro translúcido */}
            <div className="text-center mb-8">
              <div className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl rounded-xl border border-white border-opacity-20 p-8 transform hover:scale-105 transition-all duration-300">
                <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                  Panel de Control
                </h1>
                <p className="text-xl text-white mb-2 drop-shadow-md">
                  Bienvenido, <span className="font-semibold text-green-300">{user?.nombre}</span>
                </p>
                <p className="text-white text-opacity-90 drop-shadow-md font-medium">
                  Sistema de gestión de pedidos - Sirius Regenerative Solutions
                </p>
              </div>
            </div>
          </div>



          {/* Opciones principales del dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            {/* Pedido de Biológicos - Solo visible para usuarios que no son de Visualización */}
            {(!user?.rol || user?.rol !== 'Visualizacion') && (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-3xl hover:bg-opacity-40">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <FlaskConical className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Pedido de Biológicos</CardTitle>
                      <CardDescription className="text-green-100">
                        Solicita productos biológicos para regeneración
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-white text-opacity-90 mb-6 text-sm leading-relaxed">
                    Realiza pedidos de productos biológicos especializados para regeneración de suelos, 
                    incluyendo microorganismos beneficiosos y biofertilizantes.
                  </p>
                  <Link href="/pedido?tipo=biologicos">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3">
                      Hacer Pedido de Biológicos
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Pedido de Biochar - Solo visible para usuarios que no son de Visualización */}
            {(!user?.rol || user?.rol !== 'Visualizacion') && (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-3xl hover:bg-opacity-40">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <Leaf className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Pedido de Biochar</CardTitle>
                      <CardDescription className="text-orange-100">
                        Solicita biochar para mejoramiento del suelo
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-white text-opacity-90 mb-6 text-sm leading-relaxed">
                    Ordena biochar de alta calidad para mejorar la estructura del suelo, 
                    retención de agua y secuestro de carbono.
                  </p>
                  <Link href="/pedido?tipo=biochar">
                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3">
                      Hacer Pedido de Biochar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Calendario de Aplicaciones - Solo visible para usuarios que no son de Visualización */}
            {(!user?.rol || user?.rol !== 'Visualizacion') && (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-3xl hover:bg-opacity-40">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                  <div className="flex items-center space-x-3">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full">
                      <Calendar className="text-white" size={24} />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Calendario de Aplicaciones</CardTitle>
                      <CardDescription className="text-purple-100">
                        Planifica y organiza tus aplicaciones
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-white text-opacity-90 mb-6 text-sm leading-relaxed">
                    Gestiona tu calendario de aplicaciones de productos, programa tratamientos y 
                    realiza seguimiento de las fechas de aplicación.
                  </p>
                  <Link href="/calendario-aplicaciones">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3">
                      Ver Calendario
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Ver Mis Pedidos - Visible para todos */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-3xl hover:bg-opacity-40">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <ClipboardList className="text-white" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">
                      {user?.rol === 'Visualizacion' ? 'Seguimiento de Pedidos' : 'Mis Pedidos'}
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      {user?.rol === 'Visualizacion' ? 'Monitorea el estado de todos los pedidos' : 'Revisa el estado de tus pedidos'}
                    </CardDescription>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-white text-opacity-90 mb-6 text-sm leading-relaxed">
                  {user?.rol === 'Visualizacion' 
                    ? 'Consulta el estado y seguimiento de todos los pedidos del sistema en tiempo real.'
                    : 'Consulta el historial y estado actual de todos tus pedidos realizados, incluyendo seguimiento y detalles de entrega.'
                  }
                </p>
                <Link href="/mis-pedidos">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3">
                    {user?.rol === 'Visualizacion' ? 'Ver Seguimiento' : 'Ver Mis Pedidos'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sección adicional para usuarios de Visualización */}
          {user?.rol === 'Visualizacion' && (
            <div className="mb-8">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="bg-green-500 bg-opacity-20 p-3 rounded-full">
                      <ClipboardList className="text-green-400" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Panel de Visualización</h3>
                  </div>
                  <p className="text-white text-opacity-90 mb-6">
                    Como usuario de visualización, tienes acceso exclusivo al monitoreo y seguimiento de todos los pedidos del sistema.
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-green-500 bg-opacity-20 backdrop-blur-sm text-green-200 border border-green-400 border-opacity-50 px-4 py-2 rounded-full">
                    <span className="text-sm font-bold">ROL: VISUALIZACIÓN</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Información adicional */}
          <div className="text-center">
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 transform hover:scale-105 transition-all duration-300 hover:bg-opacity-40">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-white mb-4">
                  🌱 Sirius Regenerative Solutions
                </h3>
                <p className="text-white text-opacity-90 max-w-2xl mx-auto font-medium">
                  Transformando la agricultura a través de soluciones sostenibles e innovadoras. 
                  Nuestros productos biológicos y biochar están diseñados para regenerar sus suelos 
                  y maximizar la productividad de manera ambiental.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
