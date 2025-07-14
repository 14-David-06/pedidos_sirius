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
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167074/20032025-DSC_3427_1_1_zmq71m.jpg)',
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
                {pedidos.length > 0 ? `${pedidos.length} pedido(s) encontrado(s)` : 'No se encontraron pedidos'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {pedidos.length > 0 ? (
                <div className="space-y-4">
                  {pedidos.map((pedido, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Package className="h-4 w-4 text-green-600 mr-2" />
                            <span className="font-medium text-gray-900">
                              {pedido.fields['Peso Vendido (kg)']} kg en {pedido.fields['Tipo de Uso']}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-gray-600 mr-2" />
                            <span className="text-gray-700">
                              {formatDate(pedido.fields['Fecha Venta'] || pedido.createdTime)}
                            </span>
                          </div>
                          {pedido.fields['Destino'] && (
                            <div className="text-gray-700">
                              <span className="font-medium">Destino:</span> {pedido.fields['Destino']}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-gray-700 mb-2">
                            <span className="font-medium">Cliente:</span> {pedido.fields['Comprador']}
                          </div>
                          <div className="text-gray-700 mb-2">
                            <span className="font-medium">Operador:</span> {pedido.fields['Operador Responsable']}
                          </div>
                          {pedido.fields['Observaciones'] && (
                            <div className="text-gray-600 text-sm">
                              <span className="font-medium">Observaciones:</span> {pedido.fields['Observaciones']}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No se encontraron pedidos para esta cédula
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
