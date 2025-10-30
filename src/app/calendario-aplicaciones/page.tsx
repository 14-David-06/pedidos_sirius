'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Microorganismo } from '@/types';
import { 
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Beaker,
  RefreshCw,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface MicroorganismoSeleccionado {
  microorganismoId: string;
  microorganismoNombre: string;
  dosis: string;
}

interface Cronograma {
  id: string;
  aplicacion: string;
  cantidadAplicaciones: number;
  cicloDias: number;
  hectareas: number;
  fechaInicioAplicaciones: string;
  microorganismo: string;
  fechaCreacion: string;
  aplicacionesProgramadas?: string[];
}

export default function CalendarioAplicacionesPage() {
  const { user } = useAuth();
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [expandedCronograma, setExpandedCronograma] = useState<string | null>(null);

  // Datos del formulario principal
  const [formData, setFormData] = useState({
    aplicacion: '',
    cantidadAplicaciones: '',
    cicloDias: '',
    hectareas: '',
    fechaInicioAplicaciones: ''
  });

  // Estado para microorganismos
  const [microorganismos, setMicroorganismos] = useState<Microorganismo[]>([]);
  const [loadingMicroorganismos, setLoadingMicroorganismos] = useState(false);
  
  // Estado para microorganismos seleccionados
  const [microorganismosSeleccionados, setMicroorganismosSeleccionados] = useState<MicroorganismoSeleccionado[]>([]);
  const [selectedMicro, setSelectedMicro] = useState('');
  const [dosisTemporal, setDosisTemporal] = useState('');

  // Cargar cronogramas al montar el componente
  useEffect(() => {
    if (user) {
      cargarCronogramas();
    }
  }, [user]);

  const cargarCronogramas = async () => {
    try {
      setIsLoading(true);
      setError('');

      const response = await fetch(`/api/cronograma-aplicaciones/listar?usuarioId=${user?.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCronogramas(result.cronogramas);
      } else {
        setError(result.error || 'Error al cargar cronogramas');
      }
    } catch (err) {
      console.error('Error cargando cronogramas:', err);
      setError('Error de conexión al cargar cronogramas');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cargar microorganismos
  const loadMicroorganismos = useCallback(async () => {
    setLoadingMicroorganismos(true);
    try {
      const response = await fetch('/api/microorganismos');
      if (response.ok) {
        const data = await response.json();
        setMicroorganismos(data.microorganismos || []);
      } else {
        console.error('Error al cargar microorganismos:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar microorganismos:', error);
    } finally {
      setLoadingMicroorganismos(false);
    }
  }, []);

  // Cargar microorganismos al montar el componente
  useEffect(() => {
    if (user) {
      loadMicroorganismos();
    }
  }, [user, loadMicroorganismos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para agregar microorganismo seleccionado
  const agregarMicroorganismo = () => {
    if (!selectedMicro || !dosisTemporal) {
      setError('Selecciona un microorganismo y su dosis');
      return;
    }

    const microorganismoInfo = microorganismos.find(m => m.id === selectedMicro);
    if (!microorganismoInfo) return;

    const nuevoMicroorganismo: MicroorganismoSeleccionado = {
      microorganismoId: selectedMicro,
      microorganismoNombre: `${microorganismoInfo.nombre} (${microorganismoInfo.abreviatura})`,
      dosis: dosisTemporal
    };

    setMicroorganismosSeleccionados([...microorganismosSeleccionados, nuevoMicroorganismo]);
    setSelectedMicro('');
    setDosisTemporal('');
    setError('');
  };

  // Función para eliminar microorganismo seleccionado
  const eliminarMicroorganismo = (index: number) => {
    const nuevosSeleccionados = microorganismosSeleccionados.filter((_, i) => i !== index);
    setMicroorganismosSeleccionados(nuevosSeleccionados);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.aplicacion || !formData.cantidadAplicaciones || !formData.cicloDias || !formData.hectareas) {
      setError('Todos los campos del cronograma son requeridos');
      return;
    }

    if (microorganismosSeleccionados.length === 0) {
      setError('Debe seleccionar al menos un microorganismo con su dosis');
      return;
    }

    setIsCreating(true);
    setError('');
    setSuccess('');

    try {
      const requestData = {
        aplicacion: formData.aplicacion,
        cantidadAplicaciones: formData.cantidadAplicaciones,
        cicloDias: formData.cicloDias,
        hectareas: formData.hectareas,
        fechaInicioAplicaciones: formData.fechaInicioAplicaciones,
        microorganismosSeleccionados: microorganismosSeleccionados,
        clienteId: user?.entidadId || 'default_client',
        usuarioId: user?.id
      };

      const response = await fetch('/api/cronograma-aplicaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Cronograma de aplicaciones creado exitosamente');
        
        // Resetear formulario
        setFormData({
          aplicacion: '',
          cantidadAplicaciones: '',
          cicloDias: '',
          hectareas: '',
          fechaInicioAplicaciones: ''
        });
        setMicroorganismosSeleccionados([]);
        setSelectedMicro('');
        setDosisTemporal('');
        setMostrarFormulario(false);
        
        // Recargar cronogramas
        await cargarCronogramas();
      } else {
        setError(result.error || 'Error al crear cronograma');
      }
    } catch (err) {
      console.error('Error creando cronograma:', err);
      setError('Error de conexión al crear cronograma');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleExpanded = (cronogramaId: string) => {
    setExpandedCronograma(
      expandedCronograma === cronogramaId ? null : cronogramaId
    );
  };

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Espaciado superior para el navbar */}
          <div className="pt-20 mb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl rounded-xl border border-white border-opacity-20 p-8 transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full">
                    <Calendar className="text-purple-300" size={32} />
                  </div>
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    Cronogramas de Aplicaciones
                  </h1>
                </div>
                <p className="text-xl text-white mb-2 drop-shadow-md">
                  Usuario: <span className="font-semibold text-purple-300">{user?.nombre}</span>
                </p>
                <p className="text-white text-opacity-90 drop-shadow-md">
                  Crea y gestiona cronogramas de aplicaciones para tus cultivos
                </p>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <Card className="bg-red-900 bg-opacity-30 backdrop-blur-md shadow-2xl border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="text-red-400" size={24} />
                  <p className="text-white">{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="bg-green-900 bg-opacity-30 backdrop-blur-md shadow-2xl border-0 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="text-green-400" size={24} />
                  <p className="text-white">{success}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botón para crear nuevo cronograma */}
          <div className="mb-8">
            <Button
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-300"
            >
              <Plus size={20} className="mr-2" />
              {mostrarFormulario ? 'Cancelar' : 'Crear Nuevo Cronograma'}
            </Button>
          </div>

          {/* Formulario de creación */}
          {mostrarFormulario && (
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Nuevo Cronograma de Aplicaciones</CardTitle>
                <CardDescription className="text-gray-300">
                  Completa la información del cronograma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información del cronograma */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                      <label className="block text-white font-medium mb-2">
                        Nombre de la Aplicación *
                      </label>
                      <Input
                        name="aplicacion"
                        value={formData.aplicacion}
                        onChange={handleInputChange}
                        placeholder="Ej: Aplicación de bioestimulantes"
                        className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Cantidad de Aplicaciones *
                      </label>
                      <Input
                        name="cantidadAplicaciones"
                        type="number"
                        min="1"
                        value={formData.cantidadAplicaciones}
                        onChange={handleInputChange}
                        placeholder="Ej: 3"
                        className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Ciclo en Días *
                      </label>
                      <Input
                        name="cicloDias"
                        type="number"
                        min="1"
                        value={formData.cicloDias}
                        onChange={handleInputChange}
                        placeholder="Ej: 15"
                        className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Hectáreas *
                      </label>
                      <Input
                        name="hectareas"
                        type="number"
                        min="1"
                        value={formData.hectareas}
                        onChange={handleInputChange}
                        placeholder="Ej: 10"
                        className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Fecha de Inicio de Aplicaciones *
                      </label>
                      <Input
                        name="fechaInicioAplicaciones"
                        type="date"
                        value={formData.fechaInicioAplicaciones}
                        onChange={handleInputChange}
                        className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                        required
                      />
                    </div>
                  </div>

                  {/* Sección de microorganismos */}
                  <div>
                    <h3 className="text-white text-xl font-semibold mb-4">Microorganismos</h3>
                    
                    {/* Selector de microorganismo */}
                    <div className="p-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-white mb-2">
                            Seleccionar microorganismo *
                          </label>
                          {loadingMicroorganismos ? (
                            <div className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white">
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Cargando...
                              </div>
                            </div>
                          ) : (
                            <select
                              value={selectedMicro}
                              onChange={(e) => setSelectedMicro(e.target.value)}
                              className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="" className="text-gray-800">Selecciona un microorganismo</option>
                              {microorganismos
                                .filter(micro => 
                                  // Filter out already selected microorganisms
                                  !microorganismosSeleccionados.some(item => item.microorganismoId === micro.id) &&
                                  // Filter out specific microorganisms by their abbreviation
                                  !['AP', 'AB', 'PM', 'BS'].includes(micro.abreviatura)
                                )
                                .map((micro: Microorganismo) => (
                                <option key={micro.id} value={micro.id} className="text-gray-800">
                                  {micro.nombre} ({micro.abreviatura}) - {micro.tipo}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            Dosis (L/ha) *
                          </label>
                          <Input
                            type="number"
                            min="0.1"
                            step="0.1"
                            placeholder="Ej: 1.5"
                            value={dosisTemporal}
                            onChange={(e) => setDosisTemporal(e.target.value)}
                            className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                        
                        <div>
                          <Button
                            type="button"
                            onClick={agregarMicroorganismo}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4"
                          >
                            <Plus size={16} className="mr-2" />
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Lista de microorganismos seleccionados */}
                    {microorganismosSeleccionados.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Microorganismos seleccionados:</h4>
                        {microorganismosSeleccionados.map((micro, index) => {
                          const hectareasNum = parseFloat(formData.hectareas) || 0;
                          const dosisNum = parseFloat(micro.dosis) || 0;
                          const litrosTotales = hectareasNum * dosisNum;
                          
                          console.log('🧪 Cálculo microorganismo:', {
                            nombre: micro.microorganismoNombre,
                            dosis: micro.dosis,
                            hectareas: formData.hectareas,
                            hectareasNum,
                            dosisNum,
                            litrosTotales
                          });
                          
                          return (
                            <div key={index} className="flex items-center justify-between bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg p-3">
                              <div className="flex flex-col">
                                <span className="text-white font-medium">
                                  {micro.microorganismoNombre}
                                </span>
                                <span className="text-white text-opacity-80 text-sm">
                                  {micro.dosis} L/ha × {hectareasNum} ha = {litrosTotales.toFixed(1)} L totales
                                </span>
                              </div>
                              <Button
                                type="button"
                                onClick={() => eliminarMicroorganismo(index)}
                                className="bg-red-600 hover:bg-red-700 text-white p-2"
                                size="sm"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          );
                        })}
                        
                        {/* Resumen total */}
                        <div className="mt-4 p-4 bg-purple-600 bg-opacity-30 backdrop-blur-sm border border-purple-400 border-opacity-50 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-white font-medium">Total de litros por aplicación:</span>
                            <span className="text-white font-bold text-lg">
                              {microorganismosSeleccionados.reduce((total, micro) => {
                                const hectareasNum = parseFloat(formData.hectareas) || 0;
                                const dosisNum = parseFloat(micro.dosis) || 0;
                                return total + (hectareasNum * dosisNum);
                              }, 0).toFixed(1)} L
                            </span>
                          </div>
                          {formData.cantidadAplicaciones && (
                            <div className="flex justify-between items-center mt-2 pt-2 border-t border-white border-opacity-20">
                              <span className="text-white text-opacity-90 text-sm">
                                Total para {formData.cantidadAplicaciones} aplicaciones:
                              </span>
                              <span className="text-white font-bold">
                                {(microorganismosSeleccionados.reduce((total, micro) => {
                                  const hectareasNum = parseFloat(formData.hectareas) || 0;
                                  const dosisNum = parseFloat(micro.dosis) || 0;
                                  return total + (hectareasNum * dosisNum);
                                }, 0) * (parseFloat(formData.cantidadAplicaciones) || 0)).toFixed(1)} L
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones del formulario */}
                  <div className="flex space-x-4">
                    <Button
                      type="submit"
                      disabled={isCreating}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw size={20} className="mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        <>
                          <CheckCircle size={20} className="mr-2" />
                          Crear Cronograma
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={() => setMostrarFormulario(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de cronogramas */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Cronogramas Existentes</h2>
            
            {cronogramas.length === 0 ? (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl text-white mb-2">No hay cronogramas creados</h3>
                  <p className="text-gray-300">
                    Crea tu primer cronograma de aplicaciones para comenzar a organizar tus tratamientos.
                  </p>
                </CardContent>
              </Card>
            ) : (
              cronogramas.map((cronograma) => (
                <Card 
                  key={cronograma.id} 
                  className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0 overflow-hidden hover:bg-opacity-40 transition-all duration-300"
                >
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="bg-white bg-opacity-20 p-3 rounded-full">
                          <Calendar className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{cronograma.aplicacion}</h3>
                          <p className="text-white text-opacity-90 text-sm">
                            {cronograma.cantidadAplicaciones} aplicaciones cada {cronograma.cicloDias} días
                          </p>
                          <p className="text-white text-opacity-80 text-xs">
                            {cronograma.hectareas} hectáreas
                          </p>
                          {cronograma.fechaInicioAplicaciones && (
                            <p className="text-white text-opacity-80 text-xs">
                              Inicio: {new Date(cronograma.fechaInicioAplicaciones).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white text-sm">
                          Creado: {formatearFecha(cronograma.fechaCreacion)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleExpanded(cronograma.id)}
                      className="w-full p-4 text-left hover:bg-white hover:bg-opacity-5 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">
                          Ver aplicaciones programadas ({cronograma.aplicacionesProgramadas?.length || 0})
                        </span>
                        {expandedCronograma === cronograma.id ? 
                          <ChevronUp className="text-white" size={16} /> : 
                          <ChevronDown className="text-white" size={16} />
                        }
                      </div>
                    </button>
                    
                    {expandedCronograma === cronograma.id && (
                      <div className="px-4 pb-4 border-t border-white border-opacity-10">
                        <div className="bg-white bg-opacity-5 rounded-lg p-4 mt-4">
                          <h4 className="text-white font-medium mb-3 flex items-center">
                            <Beaker className="mr-2" size={16} />
                            Aplicaciones Programadas
                          </h4>
                          <div className="text-white text-opacity-90">
                            <p>IDs de aplicaciones: {cronograma.aplicacionesProgramadas?.join(', ') || 'No hay aplicaciones'}</p>
                            <p className="text-sm text-gray-300 mt-2">
                              Los detalles específicos de cada aplicación se almacenan en la base de datos.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Información adicional */}
          <div className="mt-12 text-center">
            <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Calendar className="text-purple-400" size={24} />
                  <h3 className="text-xl font-bold text-white">Cronogramas de Aplicaciones</h3>
                </div>
                <p className="text-white text-opacity-90">
                  Organiza tus aplicaciones de productos biológicos con cronogramas detallados. 
                  Define ciclos, dosis y microorganismos para un manejo eficiente de tus cultivos.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}