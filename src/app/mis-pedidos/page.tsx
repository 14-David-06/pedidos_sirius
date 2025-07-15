'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { User, Search, Package, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function MisPedidosPage() {
  const [cedula, setCedula] = useState('');
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [clienteInfo, setClienteInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const validateCedula = (cedula: string): boolean => {
    if (!/^\d+$/.test(cedula)) {
      return false;
    }
    if (cedula.length < 6 || cedula.length > 10) {
      return false;
    }
    return true;
  };

  const buscarPedidos = async () => {
    if (!cedula.trim()) {
      setError('Por favor ingresa tu número de cédula');
      return;
    }

    if (!validateCedula(cedula)) {
      setError('Ingresa una cédula válida (6-10 dígitos)');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/mis-pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula }),
      });

      if (!response.ok) {
        throw new Error('Error al buscar pedidos');
      }

      const data = await response.json();
      setPedidos(data.pedidos || []);
      setClienteInfo(data.cliente || null);
      setHasSearched(true);
    } catch (error) {
      setError('Error al buscar pedidos. Intenta de nuevo.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-CO');
    } catch {
      return dateString;
    }
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167867/DSC_3797_1_wcrfu9.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
              alt="Sirius Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Mis Pedidos de Biochar Blend
          </h1>
          <p className="text-white drop-shadow-md">
            Consulta el estado y detalles de tus pedidos
          </p>
        </div>

        {/* Formulario de búsqueda */}
        <Card className="shadow-2xl bg-white bg-opacity-95 backdrop-blur-sm border-0 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-green-800">Buscar mis pedidos</CardTitle>
            <CardDescription className="text-center">
              Ingresa tu número de cédula para ver tus pedidos
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="flex space-x-4">
              <div className="flex-1">
                <Input
                  label="Número de Cédula"
                  name="cedula"
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  error={error}
                  icon={<User className="h-4 w-4" />}
                  placeholder="Ej: 12345678"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={buscarPedidos}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultados */}
        {hasSearched && (
          <Card className="shadow-2xl bg-white bg-opacity-95 backdrop-blur-sm border-0">
            <CardHeader>
              <CardTitle className="text-xl text-green-800">
                {pedidos.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between">
                      <span>{pedidos.length} pedido(s) encontrado(s)</span>
                      {clienteInfo && (
                        <span className="text-sm font-normal text-gray-600">
                          Cliente: {clienteInfo.nombre}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  'No se encontraron pedidos'
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {pedidos.length > 0 ? (
                <div className="space-y-6">
                  {pedidos.map((pedido, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg overflow-hidden bg-gradient-to-r from-white to-green-50 shadow-sm hover:shadow-md transition-shadow">
                      {/* Header del pedido con estado */}
                      <div className="bg-green-600 text-white px-6 py-3 flex justify-between items-center">
                        <div className="flex items-center">
                          <Package className="h-5 w-5 mr-2" />
                          <span className="font-bold text-lg">
                            Pedido #{index + 1} - {pedido.fields['Peso Vendido (kg)']} kg
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            pedido.fields['Estado Pedido'] === 'En proceso' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : pedido.fields['Estado Pedido'] === 'Completado'
                              ? 'bg-green-100 text-green-800'
                              : pedido.fields['Estado Pedido'] === 'Cancelado'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {pedido.fields['Estado Pedido'] || 'Pendiente'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid md:grid-cols-3 gap-6">
                          {/* Información del Producto */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                              Detalles del Producto
                            </h4>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Tipo de Envase:</span>
                                <span className="text-gray-900 font-medium">{pedido.fields['Tipo Envase']}</span>
                              </div>
                              
                              {pedido.fields['Cantidad BigBag'] > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-700">BigBags:</span>
                                  <span className="text-green-700 font-bold">{pedido.fields['Cantidad BigBag']}</span>
                                </div>
                              )}
                              
                              {pedido.fields['Cantidad Lonas'] > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="font-medium text-gray-700">Lonas:</span>
                                  <span className="text-green-700 font-bold">{pedido.fields['Cantidad Lonas']}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Peso Total:</span>
                                <span className="text-gray-900 font-bold">{pedido.fields['Peso Vendido (kg)']} kg</span>
                              </div>
                            </div>
                          </div>

                          {/* Información de Entrega */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                              Información de Entrega
                            </h4>
                            
                            <div className="space-y-2">
                              <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                                <span className="font-medium text-gray-700">Fecha:</span>
                                <span className="text-gray-900 ml-2">
                                  {formatDate(pedido.fields['Fecha Venta'] || pedido.createdTime)}
                                </span>
                              </div>
                              
                              {pedido.fields['Destino'] && (
                                <div className="text-sm">
                                  <span className="font-medium text-gray-700">Destino:</span>
                                  <p className="text-gray-900 mt-1 break-words">{pedido.fields['Destino']}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-700">Operador:</span>
                                <span className="text-gray-900">{pedido.fields['Operador Responsable']}</span>
                              </div>
                            </div>
                          </div>

                          {/* Información de Precio */}
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2">
                              Información Financiera
                            </h4>
                            
                            {pedido.fields['Precio Total'] && (
                              <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                                <div className="text-center">
                                  <div className="text-sm text-green-700 font-medium">Total del Pedido</div>
                                  <div className="text-2xl font-bold text-green-800">
                                    ${pedido.fields['Precio Total'].toLocaleString('es-CO')} COP
                                  </div>
                                  <div className="text-xs text-green-600 mt-1">
                                    ${Math.round(pedido.fields['Precio Total'] / pedido.fields['Peso Vendido (kg)']).toLocaleString('es-CO')} COP/kg
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Resumen Total */}
                  {pedidos.length > 1 && (
                    <div className="space-y-4">
                      {/* Resumen completo */}
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-bold text-gray-800 mb-3">Resumen General de Pedidos</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                          <div>
                            <div className="text-2xl font-bold text-gray-700">
                              {pedidos.reduce((sum, p) => sum + (p.fields['Peso Vendido (kg)'] || 0), 0)} kg
                            </div>
                            <div className="text-sm text-gray-600">Total Kilogramos</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-700">
                              {pedidos.reduce((sum, p) => sum + (p.fields['Cantidad BigBag'] || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total BigBags</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-700">
                              {pedidos.reduce((sum, p) => sum + (p.fields['Cantidad Lonas'] || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Lonas</div>
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-gray-700">
                              ${pedidos.reduce((sum, p) => sum + (p.fields['Precio Total'] || 0), 0).toLocaleString('es-CO')}
                            </div>
                            <div className="text-sm text-gray-600">Total General</div>
                          </div>
                        </div>
                      </div>

                      {/* Resumen solo pedidos en proceso */}
                      {(() => {
                        const pedidosEnProceso = pedidos.filter(p => p.fields['Estado Pedido'] === 'En proceso');
                        return pedidosEnProceso.length > 0 && (
                          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                            <h3 className="font-bold text-yellow-800 mb-3 flex items-center">
                              <div className="w-3 h-3 bg-yellow-400 rounded-full mr-2"></div>
                              Pedidos En Proceso ({pedidosEnProceso.length})
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div>
                                <div className="text-2xl font-bold text-yellow-700">
                                  {pedidosEnProceso.reduce((sum, p) => sum + (p.fields['Peso Vendido (kg)'] || 0), 0)} kg
                                </div>
                                <div className="text-sm text-yellow-600">Kilogramos en Proceso</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-yellow-700">
                                  {pedidosEnProceso.reduce((sum, p) => sum + (p.fields['Cantidad BigBag'] || 0), 0)}
                                </div>
                                <div className="text-sm text-yellow-600">BigBags en Proceso</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-yellow-700">
                                  {pedidosEnProceso.reduce((sum, p) => sum + (p.fields['Cantidad Lonas'] || 0), 0)}
                                </div>
                                <div className="text-sm text-yellow-600">Lonas en Proceso</div>
                              </div>
                              <div>
                                <div className="text-2xl font-bold text-yellow-700">
                                  ${pedidosEnProceso.reduce((sum, p) => sum + (p.fields['Precio Total'] || 0), 0).toLocaleString('es-CO')}
                                </div>
                                <div className="text-sm text-yellow-600">Valor en Proceso</div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 text-lg">
                    {clienteInfo ? `No se encontraron pedidos para ${clienteInfo.nombre}` : 'No se encontraron pedidos para esta cédula'}
                  </p>
                  <Link href="/pedido">
                    <Button className="bg-green-600 hover:bg-green-700">
                      Hacer mi primer pedido
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Enlaces de navegación */}
        <div className="mt-8 text-center">
          <div className="space-x-4">
            <Link href="/">
              <Button variant="outline" className="bg-white bg-opacity-10 backdrop-blur-sm text-white border border-white border-opacity-30 hover:bg-white hover:bg-opacity-20">
                Volver al inicio
              </Button>
            </Link>
            <Link href="/pedido">
              <Button className="bg-green-600 bg-opacity-80 backdrop-blur-sm hover:bg-green-500">
                Hacer nuevo pedido
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
