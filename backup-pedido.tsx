'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  FlaskConical, 
  Leaf, 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  FileText
} from 'lucide-react';

export default function PedidoPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tipo = searchParams.get('tipo') || 'biologicos';

  const [formData, setFormData] = useState({
    producto: '',
    cantidad: '',
    unidad: 'kg',
    fechaEntrega: '',
    direccionEntrega: '',
    observaciones: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const productos = {
    biologicos: [
      'Microorganismos Beneficiosos',
      'Hongos Micorrízicos',
      'Bacterias Promotoras del Crecimiento',
      'Trichoderma',
      'Bacillus',
      'Rhizobium'
    ],
    biochar: [
      'Biochar Premium',
      'Biochar Estándar',
      'Biochar Activado',
      'Biochar Inoculado'
    ]
  };

  const unidades = tipo === 'biologicos' ? ['kg', 'gr', 'lt', 'ml'] : ['ton', 'kg', 'm³'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/create-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: user,
          tipo,
          ...formData
        })
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error('Error al enviar pedido');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (success) {
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
          
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="pt-20">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border border-white border-opacity-20 transform hover:scale-105 transition-all duration-300">
                <CardContent className="p-12 text-center">
                  <div className="mb-6">
                    <div className="bg-green-500 bg-opacity-20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                      <Package className="text-green-400" size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">¡Pedido Enviado!</h2>
                    <p className="text-white text-opacity-90">
                      Tu pedido de {tipo} ha sido enviado exitosamente. 
                      Te contactaremos pronto para confirmar los detalles.
                    </p>
                  </div>
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                  >
                    Volver al Dashboard
                  </Button>
                </CardContent>
              </Card>
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
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            {/* Header */}
            <div className="mb-6">
              <Link 
                href="/dashboard"
                className="inline-flex items-center text-white hover:text-green-400 mb-4 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver al Dashboard
              </Link>
            </div>

            {/* Formulario Principal */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border border-white border-opacity-20">
              <CardHeader className="pb-6">
                <div className="flex items-center space-x-3">
                  {tipo === 'biologicos' ? (
                    <FlaskConical className="text-green-400" size={28} />
                  ) : (
                    <Leaf className="text-orange-400" size={28} />
                  )}
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      {tipo === 'biologicos' ? 'Pedido de Productos Biológicos' : 'Pedido de Biochar'}
                    </CardTitle>
                    <CardDescription className="text-white text-opacity-80">
                      Completa el formulario para solicitar productos de {tipo === 'biologicos' ? 'microorganismos beneficiosos' : 'biochar premium'}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información del producto */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Package className="mr-2" size={20} />
                      Información del Producto
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Producto *
                      </label>
                      <select
                        value={formData.producto}
                        onChange={(e) => handleInputChange('producto', e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="" className="text-gray-800">Selecciona un producto</option>
                        {productos[tipo as keyof typeof productos].map(producto => (
                          <option key={producto} value={producto} className="text-gray-800">
                            {producto}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Cantidad *
                        </label>
                        <Input
                          type="number"
                          value={formData.cantidad}
                          onChange={(e) => handleInputChange('cantidad', e.target.value)}
                          required
                          min="1"
                          step="0.1"
                          className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60"
                          placeholder="Ej: 50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Unidad *
                        </label>
                        <select
                          value={formData.unidad}
                          onChange={(e) => handleInputChange('unidad', e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          {unidades.map(unidad => (
                            <option key={unidad} value={unidad} className="text-gray-800">
                              {unidad}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Información de entrega */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <MapPin className="mr-2" size={20} />
                      Información de Entrega
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Fecha de Entrega Deseada *
                      </label>
                      <Input
                        type="date"
                        value={formData.fechaEntrega}
                        onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                        required
                        min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                        className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Dirección de Entrega *
                      </label>
                      <textarea
                        value={formData.direccionEntrega}
                        onChange={(e) => handleInputChange('direccionEntrega', e.target.value)}
                        required
                        rows={3}
                        className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Dirección completa de entrega, incluyendo municipio y puntos de referencia"
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <FileText className="mr-2" size={20} />
                      Observaciones Adicionales
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Comentarios (Opcional)
                      </label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => handleInputChange('observaciones', e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                        placeholder="Especificaciones especiales, instrucciones de manejo, etc."
                      />
                    </div>
                  </div>

                  {/* Resumen del pedido */}
                  <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-3">Resumen del Pedido</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-white">Cliente:</span>
                          <p className="text-white text-opacity-90">{user?.nombre}</p>
                        </div>
                        <div>
                          <span className="font-medium text-white">Tipo:</span>
                          <p className="text-white text-opacity-90">{tipo === 'biologicos' ? 'Productos Biológicos' : 'Biochar'}</p>
                        </div>
                        <div>
                          <span className="font-medium text-white">Fecha de Solicitud:</span>
                          <p className="text-white text-opacity-90">{new Date().toLocaleDateString('es-ES')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Botones */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/dashboard')}
                      className="sm:w-auto bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white hover:bg-opacity-30"
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-initial text-white font-medium shadow-lg transform hover:scale-105 transition-all duration-200"
                    >
                      {isLoading ? 'Enviando Pedido...' : 'Enviar Pedido'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
