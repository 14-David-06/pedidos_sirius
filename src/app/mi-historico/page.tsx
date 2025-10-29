'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { 
  History, 
  ShoppingCart, 
  Calculator, 
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react';

interface HistoricoItem {
  id: string;
  tipo: 'pedido' | 'cotizacion' | 'aplicacion' | 'actividad';
  titulo: string;
  descripcion: string;
  fecha: string;
  estado: 'completado' | 'pendiente' | 'en_proceso' | 'cancelado';
  detalles?: any;
}

export default function MiHistoricoPage() {
  const { user } = useAuth();
  const [historicoData, setHistoricoData] = useState<HistoricoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Cargar histórico al montar el componente
  useEffect(() => {
    if (user) {
      cargarHistorico();
    }
  }, [user]);

  const cargarHistorico = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Por ahora simularemos datos del histórico
      // TODO: Implementar llamada real a la API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga

      const historicoSimulado: HistoricoItem[] = [
        {
          id: '1',
          tipo: 'pedido',
          titulo: 'Pedido de Productos Biológicos #001',
          descripcion: 'Pedido de microorganismos beneficiosos para 10 hectáreas',
          fecha: '2025-10-25T10:30:00Z',
          estado: 'completado',
          detalles: {
            productos: ['Bacillus subtilis', 'Trichoderma harzianum'],
            cantidad: '10 kg',
            total: '$450.000'
          }
        },
        {
          id: '2',
          tipo: 'cotizacion',
          titulo: 'Cotización de Biochar Premium',
          descripcion: 'Solicitud de cotización para biochar de alta calidad',
          fecha: '2025-10-20T14:15:00Z',
          estado: 'pendiente',
          detalles: {
            superficie: '25 hectáreas',
            tipo: 'Biochar Premium',
            solicitud: 'Cotización pendiente de respuesta'
          }
        },
        {
          id: '3',
          tipo: 'aplicacion',
          titulo: 'Aplicación Programada - Lote Norte',
          descripcion: 'Aplicación de productos biológicos en lote norte',
          fecha: '2025-10-18T08:00:00Z',
          estado: 'completado',
          detalles: {
            lote: 'Norte - 15 ha',
            productos: ['Bacillus subtilis'],
            metodo: 'Aspersión foliar'
          }
        },
        {
          id: '4',
          tipo: 'pedido',
          titulo: 'Pedido de Biochar #002',
          descripcion: 'Pedido de biochar para mejoramiento de suelos',
          fecha: '2025-10-15T16:45:00Z',
          estado: 'en_proceso',
          detalles: {
            productos: ['Biochar Premium 5kg'],
            cantidad: '50 kg',
            total: '$750.000'
          }
        },
        {
          id: '5',
          tipo: 'actividad',
          titulo: 'Configuración de Perfil',
          descripcion: 'Primera configuración de cuenta y contraseña',
          fecha: '2025-10-10T09:00:00Z',
          estado: 'completado',
          detalles: {
            accion: 'Configuración inicial de cuenta'
          }
        }
      ];

      setHistoricoData(historicoSimulado);
    } catch (err) {
      console.error('Error cargando histórico:', err);
      setError('Error al cargar el histórico. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return <ShoppingCart size={20} />;
      case 'cotizacion':
        return <Calculator size={20} />;
      case 'aplicacion':
        return <Calendar size={20} />;
      case 'actividad':
        return <FileText size={20} />;
      default:
        return <History size={20} />;
    }
  };

  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <CheckCircle className="text-green-400" size={16} />;
      case 'pendiente':
        return <Clock className="text-yellow-400" size={16} />;
      case 'en_proceso':
        return <Package className="text-blue-400" size={16} />;
      case 'cancelado':
        return <AlertCircle className="text-red-400" size={16} />;
      default:
        return <Clock className="text-gray-400" size={16} />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'pedido':
        return 'from-green-500 to-green-600';
      case 'cotizacion':
        return 'from-blue-500 to-blue-600';
      case 'aplicacion':
        return 'from-purple-500 to-purple-600';
      case 'actividad':
        return 'from-gray-500 to-gray-600';
      default:
        return 'from-indigo-500 to-indigo-600';
    }
  };

  const formatearFecha = (fechaISO: string) => {
    const fecha = new Date(fechaISO);
    return {
      fecha: fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hora: fecha.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const historicoFiltrado = historicoData.filter(item => 
    filtroTipo === 'todos' || item.tipo === filtroTipo
  );

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
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
          {/* Espaciado superior para el navbar */}
          <div className="pt-20 mb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl rounded-xl border border-white border-opacity-20 p-8 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="bg-indigo-500 bg-opacity-20 p-3 rounded-full">
                    <History className="text-indigo-300" size={32} />
                  </div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    Mi Histórico
                  </h1>
                </div>
                <p className="text-xl text-white mb-2 drop-shadow-md">
                  Usuario: <span className="font-semibold text-indigo-300">{user?.nombre}</span>
                </p>
                <p className="text-white text-opacity-90 drop-shadow-md">
                  Historial completo de actividades y transacciones
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="mb-8">
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-4 items-center">
                  <span className="text-white font-medium">Filtrar por tipo:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'todos', label: 'Todos', icon: <History size={16} /> },
                      { value: 'pedido', label: 'Pedidos', icon: <ShoppingCart size={16} /> },
                      { value: 'cotizacion', label: 'Cotizaciones', icon: <Calculator size={16} /> },
                      { value: 'aplicacion', label: 'Aplicaciones', icon: <Calendar size={16} /> },
                      { value: 'actividad', label: 'Actividades', icon: <FileText size={16} /> }
                    ].map((filtro) => (
                      <Button
                        key={filtro.value}
                        onClick={() => setFiltroTipo(filtro.value)}
                        variant={filtroTipo === filtro.value ? "primary" : "outline"}
                        size="sm"
                        className={`flex items-center space-x-2 ${
                          filtroTipo === filtro.value 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600' 
                            : 'bg-transparent border-white border-opacity-30 text-white hover:bg-white hover:bg-opacity-10'
                        }`}
                      >
                        {filtro.icon}
                        <span>{filtro.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista del Histórico */}
          {error && (
            <Card className="bg-red-900 bg-opacity-30 backdrop-blur-md shadow-2xl border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="text-red-400" size={24} />
                  <p className="text-white">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {historicoFiltrado.length === 0 ? (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <History className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl text-white mb-2">No hay elementos en el histórico</h3>
                  <p className="text-gray-300">
                    {filtroTipo === 'todos' 
                      ? 'Aún no tienes actividades registradas en tu histórico.'
                      : `No tienes elementos del tipo "${filtroTipo}" en tu histórico.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              historicoFiltrado.map((item) => {
                const { fecha, hora } = formatearFecha(item.fecha);
                const isExpanded = expandedItems.has(item.id);
                
                return (
                  <Card 
                    key={item.id} 
                    className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden hover:bg-opacity-40 transition-all duration-300"
                  >
                    <div className={`bg-gradient-to-r ${getColorTipo(item.tipo)} p-4`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="bg-white bg-opacity-20 p-2 rounded-full">
                            {getIconoTipo(item.tipo)}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg">{item.titulo}</h3>
                            <p className="text-white text-opacity-90 text-sm">{item.descripcion}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-white text-sm font-medium">{fecha}</p>
                            <p className="text-white text-opacity-80 text-xs">{hora}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getIconoEstado(item.estado)}
                            <span className="text-white text-sm capitalize">
                              {item.estado.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-0">
                      <button
                        onClick={() => toggleExpandItem(item.id)}
                        className="w-full p-4 text-left hover:bg-white hover:bg-opacity-5 transition-all duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white text-sm">
                            {isExpanded ? 'Ocultar detalles' : 'Ver detalles'}
                          </span>
                          {isExpanded ? <ChevronUp className="text-white" size={16} /> : <ChevronDown className="text-white" size={16} />}
                        </div>
                      </button>
                      
                      {isExpanded && item.detalles && (
                        <div className="px-4 pb-4 border-t border-white border-opacity-10">
                          <div className="bg-white bg-opacity-5 rounded-lg p-4 mt-4">
                            <h4 className="text-white font-medium mb-3">Detalles:</h4>
                            <div className="space-y-2">
                              {Object.entries(item.detalles).map(([key, value]) => (
                                <div key={key} className="flex justify-between">
                                  <span className="text-gray-300 capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="text-white">
                                    {Array.isArray(value) ? value.join(', ') : String(value)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-12 text-center">
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <History className="text-indigo-400" size={24} />
                  <h3 className="text-xl font-bold text-white">Histórico Completo</h3>
                </div>
                <p className="text-white text-opacity-90">
                  Este histórico incluye todas tus actividades en la plataforma: pedidos, cotizaciones, 
                  aplicaciones programadas y cambios en tu cuenta. Los datos se actualizan en tiempo real.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}