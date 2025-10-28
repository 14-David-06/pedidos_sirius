'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  FileText
} from 'lucide-react';

interface Pedido {
  id: string;
  tipo: 'biologicos' | 'biochar';
  producto: string;
  cantidad: string;
  unidad: string;
  fechaSolicitud: string;
  fechaEntrega: string;
  direccionEntrega: string;
  estado: 'pendiente' | 'confirmado' | 'en_proceso' | 'enviado' | 'entregado';
  observaciones?: string;
}

export default function MisPedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de pedidos
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Por ahora, todos los usuarios verán lista vacía
        // TODO: Implementar carga de pedidos desde la tabla correcta de Airtable
        console.log('🔵 Cargando pedidos del usuario...');
        setPedidos([]);
      } catch (error) {
        console.error('Error al cargar datos:', error);
        setPedidos([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Simular carga con timeout
    setTimeout(cargarDatos, 1000);
  }, [user]);

  const getEstadoInfo = (estado: string) => {
    const estados = {
      pendiente: {
        label: 'Pendiente',
        icon: Clock,
        color: 'bg-yellow-500 bg-opacity-30 text-yellow-200 border-yellow-400 border-opacity-50',
        iconColor: 'text-yellow-300'
      },
      confirmado: {
        label: 'Confirmado',
        icon: CheckCircle,
        color: 'bg-blue-500 bg-opacity-30 text-blue-200 border-blue-400 border-opacity-50',
        iconColor: 'text-blue-300'
      },
      en_proceso: {
        label: 'En Proceso',
        icon: Package,
        color: 'bg-purple-500 bg-opacity-30 text-purple-200 border-purple-400 border-opacity-50',
        iconColor: 'text-purple-300'
      },
      enviado: {
        label: 'Enviado',
        icon: Truck,
        color: 'bg-orange-500 bg-opacity-30 text-orange-200 border-orange-400 border-opacity-50',
        iconColor: 'text-orange-300'
      },
      entregado: {
        label: 'Entregado',
        icon: CheckCircle,
        color: 'bg-green-500 bg-opacity-30 text-green-200 border-green-400 border-opacity-50',
        iconColor: 'text-green-300'
      }
    };
    return estados[estado as keyof typeof estados] || estados.pendiente;
  };

  const getTipoInfo = (tipo: string) => {
    return tipo === 'biologicos' 
      ? { label: 'Productos Biológicos', color: 'bg-green-500' }
      : { label: 'Biochar', color: 'bg-orange-500' };
  };

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
          {/* Overlay para mejorar legibilidad */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="mt-4 text-white">Cargando tus pedidos...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
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
        {/* Overlay para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-white hover:text-green-400 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver al Dashboard
              </Link>
              
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                      <Package className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        {user?.tipoUsuario === 'raiz' ? 'Órdenes de Compra' : 
                         user?.rol === 'Visualizacion' ? 'Seguimiento de Pedidos' :
                         user?.rol === 'Admin' ? 'Panel de Administración' :
                         user?.rol === 'Compras' ? 'Gestión de Pedidos' :
                         'Mis Pedidos'}
                      </h1>
                      <p className="text-white text-opacity-90">
                        {user?.tipoUsuario === 'raiz' 
                          ? 'Consulta todas las órdenes de compra del sistema' 
                          : user?.rol === 'Visualizacion' 
                          ? 'Monitorea el estado de todos los pedidos en tiempo real'
                          : user?.rol === 'Admin'
                          ? 'Administra y supervisa todos los pedidos del sistema'
                          : user?.rol === 'Compras'
                          ? 'Gestiona las órdenes de compra y seguimiento'
                          : 'Consulta el estado de todos tus pedidos'
                        }
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
                      {user?.tipoUsuario === 'raiz' ? 'Información del Administrador' : 
                       user?.rol === 'Visualizacion' ? 'Panel de Seguimiento' :
                       user?.rol === 'Admin' ? 'Información del Administrador' :
                       user?.rol === 'Compras' ? 'Información de Compras' :
                       'Información del Cliente'}
                    </h3>
                    <p className="text-white text-opacity-90">{user?.nombre}</p>
                    <p className="text-sm text-white text-opacity-70">Documento: {user?.documento}</p>
                    {user?.areaEmpresa && (
                      <p className="text-sm text-white text-opacity-70">Área: {user.areaEmpresa}</p>
                    )}
                    {user?.tipoUsuario === 'raiz' && (
                      <div className="mt-2 inline-flex items-center space-x-2 bg-yellow-500 bg-opacity-20 backdrop-blur-sm text-yellow-200 border border-yellow-400 border-opacity-50 px-3 py-1 rounded-full">
                        <span className="text-xs font-bold">USUARIO RAÍZ</span>
                      </div>
                    )}
                    {user?.rol && user?.tipoUsuario !== 'raiz' && (
                      <div className={`mt-2 inline-flex items-center space-x-2 backdrop-blur-sm px-3 py-1 rounded-full ${
                        user.rol === 'Admin' ? 'bg-red-500 bg-opacity-20 text-red-200 border border-red-400 border-opacity-50' :
                        user.rol === 'Compras' ? 'bg-blue-500 bg-opacity-20 text-blue-200 border border-blue-400 border-opacity-50' :
                        user.rol === 'Visualizacion' ? 'bg-green-500 bg-opacity-20 text-green-200 border border-green-400 border-opacity-50' : ''
                      }`}>
                        <span className="text-xs font-bold">ROL: {user.rol.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">{pedidos.length}</p>
                    <p className="text-sm text-white text-opacity-70">
                      {user?.tipoUsuario === 'raiz' ? 'Total de órdenes' :
                       user?.rol === 'Visualizacion' ? 'Total en seguimiento' :
                       'Total de pedidos'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de pedidos */}
            {pedidos.length === 0 ? (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg border border-white border-opacity-20">
                <CardContent className="p-12 text-center">
                  <Package className="text-white text-opacity-60 mb-4 mx-auto" size={48} />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {user?.tipoUsuario === 'raiz' ? 'No hay órdenes' : 'No tienes pedidos'}
                  </h3>
                  <p className="text-white text-opacity-80 mb-6">
                    {user?.tipoUsuario === 'raiz' 
                      ? 'No se encontraron órdenes de compra en el sistema.'
                      : 'Aún no has realizado ningún pedido. ¡Comienza ahora!'
                    }
                  </p>
                  {user?.tipoUsuario !== 'raiz' && (
                    <Link href="/dashboard">
                      <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                        Hacer un Pedido
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {pedidos.map((pedido) => {
                  const estadoInfo = getEstadoInfo(pedido.estado);
                  const tipoInfo = getTipoInfo(pedido.tipo);
                  const IconoEstado = estadoInfo.icon;

                  return (
                    <Card key={pedido.id} className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20 hover:bg-opacity-40">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                          {/* Información principal */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className={`inline-block w-3 h-3 rounded-full ${tipoInfo.color}`}></span>
                                  <span className="text-sm font-medium text-white text-opacity-80">{tipoInfo.label}</span>
                                  <span className="text-sm text-white text-opacity-60">•</span>
                                  <span className="text-sm text-white text-opacity-80">
                                    {user?.tipoUsuario === 'raiz' ? `Orden #${pedido.id}` : `Pedido #${pedido.id}`}
                                  </span>
                                </div>
                                <h3 className="text-xl font-semibold text-white mb-1">
                                  {pedido.producto}
                                </h3>
                                <p className="text-white text-opacity-90">
                                  {pedido.cantidad} {pedido.unidad}
                                </p>
                              </div>
                              
                              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border backdrop-blur-sm ${estadoInfo.color}`}>
                                <IconoEstado size={16} className={estadoInfo.iconColor} />
                                <span className="text-sm font-medium">{estadoInfo.label}</span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2 text-white text-opacity-80">
                                <Calendar size={16} />
                                <span>Solicitado: {new Date(pedido.fechaSolicitud).toLocaleDateString('es-ES')}</span>
                              </div>
                              <div className="flex items-center space-x-2 text-white text-opacity-80">
                                <Calendar size={16} />
                                <span>Entrega: {new Date(pedido.fechaEntrega).toLocaleDateString('es-ES')}</span>
                              </div>
                              <div className="flex items-start space-x-2 text-white text-opacity-80 md:col-span-2">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{pedido.direccionEntrega}</span>
                              </div>
                              {pedido.observaciones && (
                                <div className="flex items-start space-x-2 text-white text-opacity-80 md:col-span-2">
                                  <FileText size={16} className="mt-0.5 flex-shrink-0" />
                                  <span>{pedido.observaciones}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-col space-y-2 lg:flex-shrink-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-sm bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 transition-all duration-200"
                            >
                              Ver Detalles
                            </Button>
                            {pedido.estado === 'entregado' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-sm bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30 transition-all duration-200"
                              >
                                Descargar Factura
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Botón para hacer nuevo pedido */}
            {user?.tipoUsuario !== 'raiz' && (
              <div className="mt-12 text-center">
                <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold text-white mb-4">
                      ¿Necesitas hacer otro pedido?
                    </h3>
                    <div className="space-x-4">
                      <Link href="/pedido?tipo=biologicos">
                        <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                          Pedido de Biológicos
                        </Button>
                      </Link>
                      <Link href="/pedido?tipo=biochar">
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
                          Pedido de Biochar
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
