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
  User, 
  Calendar,
  TrendingUp
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
                  Bienvenido, <span className="font-semibold text-green-300">{user?.usuario}</span>
                </p>
                <p className="text-white text-opacity-90 drop-shadow-md font-medium">
                  Sistema de gestión de pedidos - Sirius Regenerative Solutions
                </p>
              </div>
            </div>
          </div>

          {/* Tarjetas de información del usuario */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 border-l-4 border-l-blue-500 transform hover:scale-105 transition-all duration-300 hover:bg-opacity-40">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <User className="text-blue-400" size={20} />
                  <CardTitle className="text-lg font-bold text-white">Entidad</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium">{user?.nombre}</p>
              </CardContent>
            </Card>

            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 border-l-4 border-l-green-500 transform hover:scale-105 transition-all duration-300 hover:bg-opacity-40">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="text-green-400" size={20} />
                  <CardTitle className="text-lg font-bold text-white">Documento</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium">{user?.documento}</p>
              </CardContent>
            </Card>

            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 border-l-4 border-l-purple-500 transform hover:scale-105 transition-all duration-300 hover:bg-opacity-40">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="text-purple-400" size={20} />
                  <CardTitle className="text-lg font-bold text-white">Fecha</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-white font-medium">{new Date().toLocaleDateString('es-ES')}</p>
              </CardContent>
            </Card>
          </div>

          {/* Opciones principales del dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Pedido de Biológicos */}
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

            {/* Pedido de Biochar */}
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

            {/* Ver Mis Pedidos */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-3xl hover:bg-opacity-40">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-white bg-opacity-20 p-3 rounded-full">
                    <ClipboardList className="text-white" size={24} />
                  </div>
                  <div>
                    <CardTitle className="text-white text-xl">Mis Pedidos</CardTitle>
                    <CardDescription className="text-blue-100">
                      Revisa el estado de tus pedidos
                    </CardDescription>
                  </div>
                </div>
              </div>
              <CardContent className="p-6">
                <p className="text-white text-opacity-90 mb-6 text-sm leading-relaxed">
                  Consulta el historial y estado actual de todos tus pedidos realizados, 
                  incluyendo seguimiento y detalles de entrega.
                </p>
                <Link href="/mis-pedidos">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3">
                    Ver Mis Pedidos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

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
