'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  UserPlus,
  Database,
  Shield,
  User
} from 'lucide-react';

export default function ConfiguracionPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar que el usuario sea de tipo raíz o Admin
    if (user && user.tipoUsuario !== 'raiz' && user.rol !== 'Admin') {
      window.location.href = '/dashboard';
      return;
    }
    setIsLoading(false);
  }, [user]);

  if (isLoading) {
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
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
              <p className="mt-4 text-white">Cargando configuración...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Si no es usuario raíz ni Admin, no mostrar nada (ya redirigió)
  if (!user || (user.tipoUsuario !== 'raiz' && user.rol !== 'Admin')) {
    return null;
  }

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
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-white hover:text-purple-400 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver al Dashboard
              </Link>
              
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                      <Settings className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Configuración del Sistema</h1>
                      <p className="text-white text-opacity-90">
                        Panel de administración para {user.tipoUsuario === 'raiz' ? 'usuarios raíz' : 'administradores'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información del usuario */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg mb-8 border border-white border-opacity-20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {user.tipoUsuario === 'raiz' ? 'Información del Usuario Raíz' : 'Información del Administrador'}
                    </h3>
                    <p className="text-white text-opacity-90">{user.nombre}</p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center space-x-2 backdrop-blur-sm px-4 py-2 rounded-full ${
                      user.tipoUsuario === 'raiz' 
                        ? 'bg-yellow-500 bg-opacity-20 text-yellow-200 border border-yellow-400 border-opacity-50'
                        : 'bg-red-500 bg-opacity-20 text-red-200 border border-red-400 border-opacity-50'
                    }`}>
                      <Shield size={16} />
                      <span className="text-sm font-bold">
                        {user.tipoUsuario === 'raiz' ? 'USUARIO RAÍZ' : 'ADMINISTRADOR'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opciones de configuración */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Gestión de Usuarios */}
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20 hover:bg-opacity-40">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 bg-opacity-30 p-3 rounded-full">
                      <Users className="text-blue-300" size={24} />
                    </div>
                    <CardTitle className="text-white">Gestión de Usuarios</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-opacity-80 mb-4">
                    Administrar usuarios del sistema, roles y permisos.
                  </p>
                  <div className="space-y-6">
                    <div className="mb-4">
                      <Link href="/configuracion/usuarios">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4">
                          Ver Usuarios
                        </Button> 
                      </Link>
                    </div>
                    <div>
                      <Link href="/configuracion/crear-usuario">
                        <Button variant="outline" className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 py-4">
                          <UserPlus size={16} className="mr-2" />
                          Crear Usuario
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Base de Datos */}
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20 hover:bg-opacity-40">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 bg-opacity-30 p-3 rounded-full">
                      <Database className="text-green-300" size={24} />
                    </div>
                    <CardTitle className="text-white">Base de Datos</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-opacity-80 mb-4">
                    Gestión de órdenes de compra, productos y configuraciones.
                  </p>
                  <div className="space-y-6">
                    <div className="mb-4">
                      <Link href="/configuracion/ordenes">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-4">
                          Ver Órdenes
                        </Button>
                      </Link>
                    </div>
                    <div>
                      <Link href="/configuracion/productos">
                        <Button variant="outline" className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 py-4">
                          Gestionar Productos
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actualizar mi información */}
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20 hover:bg-opacity-40">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-purple-500 bg-opacity-30 p-3 rounded-full">
                      <User className="text-purple-300" size={24} />
                    </div>
                    <CardTitle className="text-white">Actualizar mi información</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-opacity-80 mb-4">
                    Actualizar mis datos personales, contraseña y configuración de perfil.
                  </p>
                  <div className="space-y-6">
                    <div className="mb-4">
                      <Link href="/configuracion/mi-perfil">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white py-4">
                          Editar Perfil
                        </Button>
                      </Link>
                    </div>
                    <div>
                      <Link href="/configuracion/cambiar-password">
                        <Button variant="outline" className="w-full bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 py-4">
                          Cambiar Contraseña
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
