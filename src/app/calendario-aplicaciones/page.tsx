'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loading } from '@/components/ui/Loading';
import { Microorganismo } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import logger from '@/lib/logger';
import { 
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Beaker,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2
} from 'lucide-react';

interface MicroorganismoSeleccionado {
  microorganismoId: string;
  microorganismoNombre: string;
  dosis: string;
  fechaProgramada?: string;
}

interface AplicacionProgramada {
  id: string;
  microorganismo: string[];
  dosis: number;
  hectareas: number;
  fechaProgramada?: string;
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
  aplicacionesProgramadas?: AplicacionProgramada[];
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

  // Estado para aplicación personalizada
  const [aplicacionPersonalizada, setAplicacionPersonalizada] = useState('');

  // Estado para microorganismos
  const [microorganismos, setMicroorganismos] = useState<Microorganismo[]>([]);
  const [loadingMicroorganismos, setLoadingMicroorganismos] = useState(false);
  
  // Estado para microorganismos seleccionados
  const [microorganismosSeleccionados, setMicroorganismosSeleccionados] = useState<MicroorganismoSeleccionado[]>([]);
  const [selectedMicro, setSelectedMicro] = useState('');
  const [dosisTemporal, setDosisTemporal] = useState('');

  // Estados para reconocimiento de voz
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // Función para procesar el resultado del reconocimiento de voz
  const handleVoiceResult = useCallback(async (transcript: string) => {
    logger.logSafe('Voice recognition result:', { transcript });
    setVoiceTranscript(transcript);
    setIsProcessingVoice(true);
    setVoiceError('');

    try {
      const response = await fetch('/api/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript }),
      });

      const result = await response.json();

      if (result.success) {
        // Actualizar el formulario con los datos procesados
        if (result.data.aplicacion) {
          setFormData(prev => ({
            ...prev,
            aplicacion: result.data.aplicacion,
            cantidadAplicaciones: result.data.cantidadAplicaciones || prev.cantidadAplicaciones,
            cicloDias: result.data.cicloDias || prev.cicloDias,
            hectareas: result.data.hectareas || prev.hectareas,
            fechaInicioAplicaciones: result.data.fechaInicioAplicaciones || prev.fechaInicioAplicaciones
          }));

          if (result.data.aplicacion === 'Otra') {
            setAplicacionPersonalizada(result.data.aplicacionPersonalizada || '');
          }
        }

        // Procesar microorganismos si están incluidos
        if (result.data.microorganismos && result.data.microorganismos.length > 0) {
          const nuevosMicroorganismos = result.data.microorganismos.map((micro: any) => {
            // Usar la función de similitud mejorada
            const microEncontrado = encontrarMicroorganismoPorSimilitud(micro.nombre);

            return {
              microorganismoId: microEncontrado?.id || '',
              microorganismoNombre: microEncontrado?.nombre || micro.nombre,
              dosis: micro.dosis?.toString() || '1.0',
              fechaProgramada: ''
            };
          });

          setMicroorganismosSeleccionados(prev => [...prev, ...nuevosMicroorganismos]);
          
          // Log para debug
          logger.logSafe('Microorganismos procesados por voz:', { 
            original: result.data.microorganismos,
            procesados: nuevosMicroorganismos
          });
        }

        setSuccess('Comando de voz procesado correctamente');
      } else {
        setVoiceError('Error al procesar el comando de voz');
      }
    } catch (error) {
      logger.errorSafe('Error processing voice command:', error);
      setVoiceError('Error al procesar el comando de voz');
    } finally {
      setIsProcessingVoice(false);
    }
  }, []);

  // Función para manejar errores de reconocimiento de voz
  const handleVoiceError = useCallback((error: string) => {
    logger.errorSafe('Speech recognition error:', { error });
    setVoiceError(`Error de reconocimiento: ${error}`);
  }, []);

  // Hook de reconocimiento de voz
  const {
    isListening,
    isSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition({
    onResult: handleVoiceResult,
    onError: handleVoiceError
  });

  // Función para validar si un cronograma es válido
  const esCronogramaValido = useCallback((cronograma: Cronograma) => {
    return (
      cronograma.aplicacion && 
      cronograma.aplicacion.trim() !== '' &&
      cronograma.cantidadAplicaciones && 
      Number(cronograma.cantidadAplicaciones) > 0 &&
      cronograma.cicloDias && 
      Number(cronograma.cicloDias) > 0 &&
      cronograma.hectareas && 
      Number(cronograma.hectareas) > 0 &&
      cronograma.fechaCreacion &&
      cronograma.fechaCreacion !== 'Invalid Date' &&
      !isNaN(new Date(cronograma.fechaCreacion).getTime())
    );
  }, []);

  // Función para encontrar microorganismo por similitud de nombre
  const encontrarMicroorganismoPorSimilitud = useCallback((nombreVoz: string) => {
    if (!nombreVoz || microorganismos.length === 0) return null;

    const nombreLimpio = nombreVoz.toLowerCase().trim();
    
    // Busqueda exacta primero
    let encontrado = microorganismos.find(m => 
      m.nombre.toLowerCase() === nombreLimpio
    );
    
    if (encontrado) return encontrado;

    // Busqueda por inclusión
    encontrado = microorganismos.find(m => 
      m.nombre.toLowerCase().includes(nombreLimpio) ||
      nombreLimpio.includes(m.nombre.toLowerCase())
    );
    
    if (encontrado) return encontrado;

    // Búsqueda por palabras clave comunes
    const palabrasClave = {
      'tricho': 'Trichoderma',
      'bacilus': 'Bacillus',
      'pseudo': 'Pseudomonas', 
      'beauver': 'Beauveria',
      'metar': 'Metarhizium',
      'paeci': 'Paecilomyces',
      'rhizo': 'Rhizobium',
      'azoto': 'Azotobacter',
      'mico': 'Mycorrhizae',
      'strepto': 'Streptomyces'
    };

    for (const [clave, valor] of Object.entries(palabrasClave)) {
      if (nombreLimpio.includes(clave)) {
        encontrado = microorganismos.find(m => 
          m.nombre.toLowerCase().includes(valor.toLowerCase())
        );
        if (encontrado) return encontrado;
      }
    }

    return null;
  }, [microorganismos]);

  // Filtrar cronogramas válidos
  const cronogramasValidos = cronogramas.filter(esCronogramaValido);

  // Cargar cronogramas al montar el componente
  const cargarCronogramas = useCallback(async () => {
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
        
        // Debug: Filtrar cronogramas inválidos
        const cronogramasInvalidos = (result.cronogramas || []).filter((cronograma: Cronograma) => !esCronogramaValido(cronograma));
        if (cronogramasInvalidos.length > 0) {
          logger.logSafe('Cronogramas inválidos encontrados:', { 
            cantidad: cronogramasInvalidos.length,
            ids: cronogramasInvalidos.map((c: Cronograma) => c.id)
          });
        }
      } else {
        setError(result.error || 'Error al cargar cronogramas');
      }
    } catch (err) {
      logger.errorSafe('Error cargando cronogramas:', err);
      setError('Error de conexión al cargar cronogramas');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      cargarCronogramas();
    }
  }, [user, cargarCronogramas]);

  // Función para cargar microorganismos
  const loadMicroorganismos = useCallback(async () => {
    setLoadingMicroorganismos(true);
    try {
      const response = await fetch('/api/microorganismos');
      if (response.ok) {
        const data = await response.json();
        setMicroorganismos(data.microorganismos || []);
      } else {
        logger.errorSafe('Error al cargar microorganismos:', response.statusText);
      }
    } catch (error) {
      logger.errorSafe('Error al cargar microorganismos:', error);
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
    
    if (name === 'aplicacion') {
      // Si selecciona "Otro", limpiar el campo personalizado
      if (value !== 'Otro') {
        setAplicacionPersonalizada('');
      }
    }
    
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

    // Validar aplicación personalizada si se seleccionó "Otro"
    if (formData.aplicacion === 'Otro' && !aplicacionPersonalizada.trim()) {
      setError('Debe especificar el nombre de la aplicación personalizada');
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
      // Determinar el nombre final de la aplicación
      const nombreAplicacion = formData.aplicacion === 'Otro' ? aplicacionPersonalizada : formData.aplicacion;
      
      const requestData = {
        aplicacion: nombreAplicacion,
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
        setAplicacionPersonalizada('');
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
      logger.errorSafe('Error creando cronograma:', err);
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

  // Función para actualizar fecha de aplicación
  const actualizarFechaAplicacion = async (aplicacionId: string, fechaProgramada: string, fechaInicioAplicaciones: string) => {
    try {
      setError('');
      
      const response = await fetch('/api/cronograma-aplicaciones/actualizar-fecha', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aplicacionId,
          fechaProgramada,
          fechaInicioAplicaciones
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess('Fecha de aplicación actualizada correctamente');
        
        // Actualizar el estado local
        setCronogramas(prevCronogramas => 
          prevCronogramas.map(cronograma => ({
            ...cronograma,
            aplicacionesProgramadas: cronograma.aplicacionesProgramadas?.map(aplicacion => 
              aplicacion.id === aplicacionId 
                ? { ...aplicacion, fechaProgramada }
                : aplicacion
            )
          }))
        );
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.error || 'Error al actualizar fecha de aplicación');
      }
    } catch (err) {
      logger.errorSafe('Error actualizando fecha:', err);
      setError('Error de conexión al actualizar fecha de aplicación');
    }
  };

  const formatearFecha = (fechaISO: string) => {
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        return 'Fecha no válida';
      }
      return fecha.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Fecha no válida';
    }
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-2xl">Nuevo Cronograma de Aplicaciones</CardTitle>
                    <CardDescription className="text-gray-300">
                      Completa la información del cronograma o usa el comando de voz
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Estado del reconocimiento de voz en tiempo real */}
                    {(transcript || interimTranscript) && (
                      <div className="max-w-xs">
                        <div className="text-xs text-green-300 font-medium mb-1">
                          Transcripción:
                        </div>
                        <div className="text-xs bg-gray-800 bg-opacity-50 p-2 rounded border border-gray-600">
                          <span className="text-white">{transcript}</span>
                          <span className="text-gray-400 italic">{interimTranscript}</span>
                          {isListening && <span className="animate-pulse">|</span>}
                        </div>
                      </div>
                    )}
                    
                    {/* Botón de micrófono */}
                    {isSupported && (
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          type="button"
                          onClick={() => {
                            if (isListening) {
                              stopListening();
                            } else {
                              setVoiceError('');
                              setVoiceTranscript('');
                              resetTranscript();
                              startListening();
                            }
                          }}
                          disabled={isProcessingVoice}
                          className={`
                            relative p-3 rounded-full transition-all duration-300
                            ${isListening 
                              ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                              : 'bg-green-600 hover:bg-green-700'
                            }
                            ${isProcessingVoice ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                          title={isListening ? 'Detener grabación (Click para finalizar)' : 'Iniciar comando de voz'}
                        >
                        {isProcessingVoice ? (
                          <Volume2 size={20} className="text-white animate-spin" />
                        ) : isListening ? (
                          <MicOff size={20} className="text-white" />
                        ) : (
                          <Mic size={20} className="text-white" />
                        )}
                        
                        {/* Efecto visual durante la grabación */}
                        {isListening && (
                          <div className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping"></div>
                        )}
                      </Button>
                      
                      {/* Etiqueta de estado */}
                      <span className={`text-xs font-medium ${isListening ? 'text-red-300' : 'text-green-300'}`}>
                        {isListening ? 'Grabando...' : 'Listo'}
                      </span>
                    </div>
                    )}
                  </div>
                </div>
                
                {/* Mensajes de estado de voz */}
                {voiceError && (
                  <div className="mt-3 p-3 bg-red-900 bg-opacity-50 border border-red-500 rounded-lg">
                    <p className="text-red-300 text-sm flex items-center">
                      <AlertTriangle size={16} className="mr-2" />
                      {voiceError}
                    </p>
                  </div>
                )}
                
                {isProcessingVoice && (
                  <div className="mt-3 p-3 bg-blue-900 bg-opacity-50 border border-blue-500 rounded-lg">
                    <p className="text-blue-300 text-sm flex items-center">
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Procesando comando de voz...
                    </p>
                  </div>
                )}

                {/* Ayuda para comandos de voz */}
                {isSupported && (
                  <div className="mt-3 p-3 bg-gray-900 bg-opacity-50 border border-gray-600 rounded-lg">
                    <details className="group">
                      <summary className="text-gray-300 text-sm cursor-pointer flex items-center">
                        <ChevronDown size={16} className="mr-2 group-open:rotate-180 transition-transform" />
                        💡 Ayuda para comandos de voz
                      </summary>
                      <div className="mt-3 text-gray-400 text-xs space-y-2">
                        <p><strong>Cómo usar:</strong></p>
                        <ol className="list-decimal list-inside space-y-1 ml-4">
                          <li>Presiona el botón verde del micrófono para iniciar</li>
                          <li>Habla tu comando (puedes tomarte el tiempo que necesites)</li>
                          <li>Presiona el botón rojo para finalizar cuando termines</li>
                          <li>El sistema procesará automáticamente tu comando</li>
                        </ol>
                        <p><strong>Ejemplos de comandos:</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>"Crear aplicación preventiva foliar para 20 hectáreas con 3 aplicaciones cada 15 días usando trichoderma"</li>
                          <li>"Aplicación curativa de suelo en 50 hectáreas, 2 aplicaciones cada 10 días con bacillus subtilis dosis 1.5"</li>
                          <li>"Preventiva foliar para 30 hectáreas comenzando el 15 de enero con beauveria bassiana"</li>
                          <li>"Control de plagas con metarhizium, 40 hectáreas, 4 aplicaciones cada 7 días"</li>
                        </ul>
                        <p className="text-yellow-400">
                          <strong>Tip:</strong> Menciona el microorganismo que quieres usar. El sistema corregirá automáticamente nombres mal pronunciados.
                        </p>
                      </div>
                    </details>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información del cronograma */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3">
                      <label className="block text-white font-medium mb-2">
                        Tipo de Aplicación *
                      </label>
                      <select
                        name="aplicacion"
                        value={formData.aplicacion}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      >
                        <option value="" className="text-gray-800">Selecciona el tipo de aplicación</option>
                        <option value="Preventivo Foliar" className="text-gray-800">Preventivo Foliar</option>
                        <option value="Preventivo Edáfico" className="text-gray-800">Preventivo Edáfico</option>
                        <option value="Control Plagas" className="text-gray-800">Control Plagas</option>
                        <option value="Control Enfermedades" className="text-gray-800">Control Enfermedades</option>
                        <option value="Otro" className="text-gray-800">Otro</option>
                      </select>
                      
                      {/* Campo de texto condicional para aplicación personalizada */}
                      {formData.aplicacion === 'Otro' && (
                        <div className="mt-3">
                          <label className="block text-white font-medium mb-2">
                            Especificar Aplicación *
                          </label>
                          <Input
                            type="text"
                            value={aplicacionPersonalizada}
                            onChange={(e) => setAplicacionPersonalizada(e.target.value)}
                            placeholder="Ej: Aplicación de bioestimulantes"
                            className="bg-white bg-opacity-10 border-white border-opacity-30 text-white placeholder-gray-300"
                            required
                          />
                        </div>
                      )}
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
                          
                          logger.logSafe('🧪 Cálculo microorganismo:', {
                            nombre: micro.microorganismoNombre,
                            dosis: micro.dosis,
                            hectareas: formData.hectareas,
                            hectareasNum,
                            dosisNum,
                            litrosTotales
                          });
                          
                          return (
                            <div key={index} className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-3">
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
                              
                              {/* Campo de fecha programada opcional */}
                              <div className="mt-2">
                                <label className="block text-white text-sm font-medium mb-1">
                                  Fecha Programada (opcional)
                                </label>
                                <Input
                                  type="date"
                                  value={micro.fechaProgramada || ''}
                                  min={formData.fechaInicioAplicaciones || undefined}
                                  onChange={(e) => {
                                    const nuevosSeleccionados = [...microorganismosSeleccionados];
                                    nuevosSeleccionados[index].fechaProgramada = e.target.value;
                                    setMicroorganismosSeleccionados(nuevosSeleccionados);
                                  }}
                                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white"
                                  placeholder="Selecciona una fecha"
                                />
                                {formData.fechaInicioAplicaciones && (
                                  <p className="text-white text-opacity-70 text-xs mt-1">
                                    Debe ser posterior a {new Date(formData.fechaInicioAplicaciones).toLocaleDateString('es-CO')}
                                  </p>
                                )}
                              </div>
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
            
            {cronogramasValidos.length === 0 ? (
              <Card className="bg-black bg-opacity-30 backdrop-blur-md shadow-2xl border-0">
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-xl text-white mb-2">
                    {cronogramas.length === 0 ? 'No hay cronogramas creados' : 'No hay cronogramas válidos'}
                  </h3>
                  <p className="text-gray-300">
                    {cronogramas.length === 0 
                      ? 'Crea tu primer cronograma de aplicaciones para comenzar a organizar tus tratamientos.'
                      : 'Los cronogramas existentes contienen datos incompletos o inválidos y han sido ocultados.'
                    }
                  </p>
                  
                  {cronogramas.length > 0 && cronogramasValidos.length === 0 && (
                    <div className="mt-4 p-3 bg-yellow-900 bg-opacity-50 border border-yellow-500 rounded-lg">
                      <p className="text-yellow-300 text-sm">
                        Se encontraron {cronogramas.length} cronograma(s) con datos inválidos que han sido ocultados para mejorar la experiencia.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              cronogramasValidos.map((cronograma) => (
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
                          <div className="space-y-3">
                            {cronograma.aplicacionesProgramadas && cronograma.aplicacionesProgramadas.length > 0 ? (
                              cronograma.aplicacionesProgramadas.map((aplicacion, index) => (
                                <div key={aplicacion.id} className="bg-white bg-opacity-10 rounded-lg p-3">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                                    <div>
                                      <p className="text-white font-medium">
                                        Microorganismo {index + 1}
                                      </p>
                                      <p className="text-gray-300 text-sm">
                                        Dosis: {aplicacion.dosis} L/ha
                                      </p>
                                      <p className="text-gray-300 text-sm">
                                        Hectáreas: {aplicacion.hectareas}
                                      </p>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-white text-sm font-medium mb-1">
                                        Fecha Programada
                                      </label>
                                      <Input
                                        type="date"
                                        value={aplicacion.fechaProgramada || ''}
                                        min={cronograma.fechaInicioAplicaciones}
                                        onChange={(e) => actualizarFechaAplicacion(aplicacion.id, e.target.value, cronograma.fechaInicioAplicaciones)}
                                        className="bg-white bg-opacity-20 border-white border-opacity-30 text-white"
                                      />
                                    </div>
                                    
                                    <div className="flex items-center">
                                      {aplicacion.fechaProgramada ? (
                                        <div className="flex items-center text-green-400">
                                          <CheckCircle size={16} className="mr-1" />
                                          <span className="text-sm">Programada</span>
                                        </div>
                                      ) : (
                                        <div className="flex items-center text-yellow-400">
                                          <AlertTriangle size={16} className="mr-1" />
                                          <span className="text-sm">Sin programar</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-white text-opacity-90">
                                No hay aplicaciones programadas para este cronograma.
                              </p>
                            )}
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
