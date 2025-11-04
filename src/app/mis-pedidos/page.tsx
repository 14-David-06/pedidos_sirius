'use client';
import logger from '@/lib/logger';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrdenCompra } from '@/types';
import { 
  ArrowLeft, 
  Package, 
  Calendar, 
  MapPin, 
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  FileText,
  DollarSign,
  ShoppingCart
} from 'lucide-react';

export default function MisPedidosPage() {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarOrdenes = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        logger.log('Cargando órdenes del usuario...');
        const response = await fetch('/api/mis-pedidos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          throw new Error('Error al cargar órdenes');
        }

        const data = await response.json();
        logger.log('Órdenes cargadas:', data);
        
        if (data.success) {
          setOrdenes(data.ordenes || []);
        } else {
          setError(data.message || 'Error al cargar órdenes');
        }
      } catch (error) {
        logger.errorSafe('Error al cargar órdenes:', error);
        setError('Error al cargar las órdenes');
        setOrdenes([]);
      } finally {
        setIsLoading(false);
      }
    };

    cargarOrdenes();
  }, [user]);

  const getEstadoInfo = (estado: string) => {
    const estados = {
      'Pendiente': {
        label: 'Pendiente',
        icon: Clock,
        color: 'bg-yellow-500 bg-opacity-30 text-yellow-200 border-yellow-400 border-opacity-50',
        iconColor: 'text-yellow-300'
      },
      'Confirmado': {
        label: 'Confirmado',
        icon: CheckCircle,
        color: 'bg-blue-500 bg-opacity-30 text-blue-200 border-blue-400 border-opacity-50',
        iconColor: 'text-blue-300'
      },
      'En Proceso': {
        label: 'En Proceso',
        icon: Package,
        color: 'bg-purple-500 bg-opacity-30 text-purple-200 border-purple-400 border-opacity-50',
        iconColor: 'text-purple-300'
      },
      'Enviado': {
        label: 'Enviado',
        icon: Truck,
        color: 'bg-orange-500 bg-opacity-30 text-orange-200 border-orange-400 border-opacity-50',
        iconColor: 'text-orange-300'
      },
      'Entregado': {
        label: 'Entregado',
        icon: CheckCircle,
        color: 'bg-green-500 bg-opacity-30 text-green-200 border-green-400 border-opacity-50',
        iconColor: 'text-green-300'
      },
      'Cancelado': {
        label: 'Cancelado',
        icon: AlertCircle,
        color: 'bg-red-500 bg-opacity-30 text-red-200 border-red-400 border-opacity-50',
        iconColor: 'text-red-300'
      }
    };
    return estados[estado as keyof typeof estados] || estados['Pendiente'];
  };

  const getAreaInfo = (area: string) => {
    return area === 'Laboratorio' 
      ? { label: 'Productos Biológicos', color: 'bg-green-500' }
      : { label: 'Biochar', color: 'bg-orange-500' };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const totalOrdenes = ordenes.length;
  const totalGastado = ordenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
  const ordenesPendientes = ordenes.filter(o => o.estadoOrden === 'Pendiente').length;
  const ordenesEntregadas = ordenes.filter(o => o.estadoOrden === 'Entregado').length;

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen py-12 relative" style={{backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center pt-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
              <p className="mt-4 text-white">Cargando órdenes...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen py-12 relative" style={{backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat'}}>
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            <div className="mb-8">
              <Link href="/dashboard" className="inline-flex items-center text-white hover:text-green-400 mb-6 transition-colors duration-200">
                <ArrowLeft size={20} className="mr-2" />
                Volver al Dashboard
              </Link>
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                      <ShoppingCart className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Dashboard de Órdenes</h1>
                      <p className="text-white text-opacity-90">Consulta todas las órdenes de compra de tu entidad</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white text-opacity-70">Total Órdenes</p>
                      <p className="text-2xl font-bold text-white">{totalOrdenes}</p>
                    </div>
                    <Package className="text-white text-opacity-60" size={32} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white text-opacity-70">Total Gastado</p>
                      <p className="text-xl font-bold text-white">{formatCurrency(totalGastado)}</p>
                    </div>
                    <DollarSign className="text-white text-opacity-60" size={32} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white text-opacity-70">Pendientes</p>
                      <p className="text-2xl font-bold text-yellow-300">{ordenesPendientes}</p>
                    </div>
                    <Clock className="text-yellow-300" size={32} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-white text-opacity-70">Entregadas</p>
                      <p className="text-2xl font-bold text-green-300">{ordenesEntregadas}</p>
                    </div>
                    <CheckCircle className="text-green-300" size={32} />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg mb-8 border border-white border-opacity-20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Información de la Entidad</h3>
                    <p className="text-white text-opacity-90">{user?.nombre}</p>
                    <p className="text-sm text-white text-opacity-70">Documento: {user?.documento}</p>
                    {user?.areaEmpresa && (<p className="text-sm text-white text-opacity-70">Área: {user.areaEmpresa}</p>)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {error && (
              <Card className="bg-red-500 bg-opacity-20 backdrop-blur-md border border-red-400 border-opacity-50 mb-8">
                <CardContent className="p-6"><p className="text-white">{error}</p></CardContent>
              </Card>
            )}

            {ordenes.length === 0 ? (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg border border-white border-opacity-20">
                <CardContent className="p-12 text-center">
                  <Package className="text-white text-opacity-60 mb-4 mx-auto" size={48} />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay órdenes registradas</h3>
                  <p className="text-white text-opacity-80 mb-6">No se encontraron órdenes de compra para tu entidad.</p>
                  <Link href="/pedido">
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">Crear Nueva Orden</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {ordenes.map((orden) => {
                  const estadoInfo = getEstadoInfo(orden.estadoOrden);
                  const areaInfo = getAreaInfo(orden.areaSirius);
                  const IconoEstado = estadoInfo.icon;
                  return (
                    <Card key={orden.id} className="bg-black bg-opacity-30 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20 hover:bg-opacity-40">
                      <CardContent className="p-6">
                        <div className="flex flex-col space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={'inline-block w-3 h-3 rounded-full ' + areaInfo.color}></span>
                                <span className="text-sm font-medium text-white text-opacity-80">{areaInfo.label}</span>
                                <span className="text-sm text-white text-opacity-60">•</span>
                                <span className="text-sm text-white text-opacity-80">Orden #{orden.id.substring(0, 8)}</span>
                              </div>
                              <h3 className="text-xl font-semibold text-white mb-1">Solicitado por: {orden.realizaRegistro}</h3>
                            </div>
                            <div className={'inline-flex items-center space-x-2 px-3 py-1 rounded-full border backdrop-blur-sm ' + estadoInfo.color}>
                              <IconoEstado size={16} className={estadoInfo.iconColor} />
                              <span className="text-sm font-medium">{estadoInfo.label}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2 text-white text-opacity-80">
                              <Calendar size={16} />
                              <span>Fecha de entrega: {new Date(orden.fechaRecogida).toLocaleDateString('es-ES')}</span>
                            </div>
                            {orden.ubicacionAplicacion && (
                              <div className="flex items-start space-x-2 text-white text-opacity-80">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{orden.ubicacionAplicacion}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2 text-white text-opacity-80">
                              <Truck size={16} />
                              <span>{orden.necesitaEnvio ? 'Requiere envío' : 'Recoge en sitio'}</span>
                            </div>
                            {orden.observaciones && (
                              <div className="flex items-start space-x-2 text-white text-opacity-80 md:col-span-2">
                                <FileText size={16} className="mt-0.5 flex-shrink-0" />
                                <span>{orden.observaciones}</span>
                              </div>
                            )}
                          </div>

                          {orden.productos && orden.productos.length > 0 && (
                            <div className="mt-4">
                              <h4 className="text-white font-semibold mb-3 flex items-center"><Package size={18} className="mr-2" />Productos ({orden.productos.length})</h4>
                              <div className="bg-white bg-opacity-10 rounded-lg overflow-hidden">
                                <table className="w-full">
                                  <thead className="bg-white bg-opacity-10">
                                    <tr>
                                      <th className="text-left px-4 py-2 text-white text-sm">Producto</th>
                                      <th className="text-center px-4 py-2 text-white text-sm">Cantidad</th>
                                      <th className="text-right px-4 py-2 text-white text-sm">Precio Unit.</th>
                                      <th className="text-right px-4 py-2 text-white text-sm">Subtotal</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {orden.productos.map((producto, index) => (
                                      <tr key={index} className="border-t border-white border-opacity-10">
                                        <td className="px-4 py-3 text-white">{producto.nombreProducto}</td>
                                        <td className="px-4 py-3 text-white text-center">{producto.cantidad} {producto.unidadMedida}</td>
                                        <td className="px-4 py-3 text-white text-right">{formatCurrency(producto.precioUnitario)}</td>
                                        <td className="px-4 py-3 text-white text-right font-semibold">{formatCurrency(producto.subtotal)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot className="bg-white bg-opacity-10">
                                    <tr>
                                      <td colSpan={3} className="px-4 py-3 text-white font-semibold text-right">Total:</td>
                                      <td className="px-4 py-3 text-green-300 font-bold text-right text-lg">{formatCurrency(orden.total || 0)}</td>
                                    </tr>
                                  </tfoot>
                                </table>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="mt-12 text-center">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <h3 className="text-xl font-semibold text-white mb-4">¿Necesitas hacer un nuevo pedido?</h3>
                  <Link href="/pedido">
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:scale-105 transition-all duration-200">Crear Nueva Orden</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

