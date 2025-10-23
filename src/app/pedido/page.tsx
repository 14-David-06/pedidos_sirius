'use client';

// Extender la interfaz Window para incluir APIs de reconocimiento de voz
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Microorganismo } from '@/types'; // NUEVO IMPORT - Tipo para microorganismo
import { 
  FlaskConical, 
  Leaf, 
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  FileText,
  Mic,
  MicOff,
  Square
} from 'lucide-react';

function PedidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tipo = searchParams.get('tipo') || 'biologicos';

  const [formData, setFormData] = useState({
    microorganismosSeleccionados: [] as Array<{
      microorganismoId: string;
      microorganismoNombre: string;
      cantidad: number;
    }>, // Array de microorganismos seleccionados con cantidades
    biocharTipo: '',
    biocharCantidad: '',
    biocharUnidad: 'kg',
    recogesPedido: '', // 'si' o 'no'
    fechaEntrega: '',
    ubicacionAplicacion: '', // Campo para ubicación de aplicación del producto
    observaciones: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [microorganismos, setMicroorganismos] = useState<Microorganismo[]>([]); // Lista de microorganismos disponibles
  const [productosPirolisis, setProductosPirolisis] = useState<any[]>([]); // Lista de productos de pirólisis
  
  // Estados para grabación de voz
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [loadingMicroorganismos, setLoadingMicroorganismos] = useState(false);
  const [loadingProductosPirolisis, setLoadingProductosPirolisis] = useState(false);
  
  // Estados para el selector de microorganismos
  const [selectedMicro, setSelectedMicro] = useState('');
  const [cantidadTemporal, setCantidadTemporal] = useState('');

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
      'Biochar Blend',
      'Start Dust',
      'Tricochar'
    ]
  };

  const unidades = tipo === 'biologicos' ? ['kg', 'gr', 'lt', 'ml'] : ['ton', 'kg', 'm³'];

  // NUEVA FUNCIÓN - Cargar microorganismos al montar el componente (solo para productos biológicos)
  const loadMicroorganismos = useCallback(async () => {
    if (tipo !== 'biologicos') return;
    
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
  }, [tipo]);

  // NUEVA FUNCIÓN - Cargar productos de pirólisis al montar el componente (solo para biochar)
  const loadProductosPirolisis = useCallback(async () => {
    if (tipo !== 'biochar') return;
    
    setLoadingProductosPirolisis(true);
    try {
      const response = await fetch('/api/productos-pirolisis');
      if (response.ok) {
        const data = await response.json();
        setProductosPirolisis(data.productos || []);
      } else {
        console.error('Error al cargar productos de pirólisis:', response.statusText);
      }
    } catch (error) {
      console.error('Error al cargar productos de pirólisis:', error);
    } finally {
      setLoadingProductosPirolisis(false);
    }
  }, [tipo]);

  // Cargar microorganismos al montar el componente si es tipo biológicos
  useEffect(() => {
    if (tipo === 'biologicos') {
      loadMicroorganismos();
    }
  }, [tipo, loadMicroorganismos]);

  // Cargar productos de pirólisis al montar el componente si es tipo biochar
  useEffect(() => {
    if (tipo === 'biochar') {
      loadProductosPirolisis();
    }
  }, [tipo, loadProductosPirolisis]);

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'es-ES';
        
        recognition.onstart = () => {
          setIsListening(true);
        };
        
        recognition.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          if (finalTranscript) {
            setFormData(prev => ({
              ...prev,
              observaciones: prev.observaciones + finalTranscript + ' '
            }));
          }
        };
        
        recognition.onerror = (event: any) => {
          console.error('Error en reconocimiento de voz:', event.error);
          setIsListening(false);
          setIsRecording(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
          if (isRecording) {
            recognition.start(); // Reiniciar si todavía está grabando
          }
        };
        
        setRecognition(recognition);
      } else {
        setSpeechSupported(false);
      }
    }
  }, [isRecording]);

  // NUEVAS FUNCIONES - Manejar selección de microorganismos
  const agregarMicroorganismo = (microorganismo: Microorganismo) => {
    const yaSeleccionado = formData.microorganismosSeleccionados.find(
      m => m.microorganismoId === microorganismo.id
    );
    
    if (!yaSeleccionado) {
      setFormData(prev => ({
        ...prev,
        microorganismosSeleccionados: [
          ...prev.microorganismosSeleccionados,
          {
            microorganismoId: microorganismo.id,
            microorganismoNombre: microorganismo.nombre,
            cantidad: 1 // cantidad por defecto
          }
        ]
      }));
    }
  };

  const removerMicroorganismo = (id: string) => {
    setFormData(prev => {
      const nuevosSeleccionados = prev.microorganismosSeleccionados.filter(
        m => m.microorganismoId !== id
      );

      // Verificar si se está quitando Bacillus thuringiensis
      const microorganismoEliminado = prev.microorganismosSeleccionados.find(m => m.microorganismoId === id);
      const seQuitaBacillus = microorganismoEliminado && (
        microorganismoEliminado.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
        microorganismoEliminado.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
      );

      const tieneBacillusDespues = nuevosSeleccionados.some(micro => 
        micro.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
        micro.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
      );

      return {
        ...prev,
        microorganismosSeleccionados: nuevosSeleccionados,
        // Limpiar fecha si se quitó el último Bacillus thuringiensis
        fechaEntrega: (seQuitaBacillus && !tieneBacillusDespues) ? '' : prev.fechaEntrega
      };
    });
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    setFormData(prev => ({
      ...prev,
      microorganismosSeleccionados: prev.microorganismosSeleccionados.map(m =>
        m.microorganismoId === id ? { ...m, cantidad } : m
      )
    }));
  };

  // Funciones para biochar
  const setBiocharTipo = (valor: string) => {
    setFormData(prev => ({ ...prev, biocharTipo: valor }));
  };

  const setBiocharCantidad = (valor: string) => {
    setFormData(prev => ({ ...prev, biocharCantidad: valor }));
  };

  const setBiocharUnidad = (valor: string) => {
    setFormData(prev => ({ ...prev, biocharUnidad: valor }));
  };

  // Función para calcular días hábiles (lunes a viernes)
  const calcularFechaMinima = () => {
    const hoy = new Date();
    const hayBacillusThuringiensis = formData.microorganismosSeleccionados.some(micro => 
      micro.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
      micro.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
    );
    
    // Si hay Bacillus thuringiensis, necesita 4 días hábiles, sino 7 días calendario normales
    const diasNecesarios = hayBacillusThuringiensis ? 4 : 7;
    const esParaDiasHabiles = hayBacillusThuringiensis;
    
    let fecha = new Date(hoy);
    let diasContados = 0;
    
    if (esParaDiasHabiles) {
      // Contar solo días hábiles (lunes=1 a viernes=5)
      while (diasContados < diasNecesarios) {
        fecha.setDate(fecha.getDate() + 1);
        const diaSemana = fecha.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
        if (diaSemana >= 1 && diaSemana <= 5) { // Lunes a viernes
          diasContados++;
        }
      }
    } else {
      // Días calendario normales
      fecha.setDate(fecha.getDate() + diasNecesarios);
    }
    
    return fecha.toISOString().split('T')[0];
  };

  // Función para validar fecha según microorganismos seleccionados
  const validarFechaEntrega = (fechaSeleccionada: string) => {
    const fechaMinima = calcularFechaMinima();
    const fechaSeleccionadaDate = new Date(fechaSeleccionada);
    const fechaMinimaDate = new Date(fechaMinima);
    
    const hayBacillusThuringiensis = formData.microorganismosSeleccionados.some(micro => 
      micro.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
      micro.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
    );
    
    if (fechaSeleccionadaDate < fechaMinimaDate) {
      if (hayBacillusThuringiensis) {
        alert(`El microorganismo Bacillus thuringiensis requiere un mínimo de 4 días hábiles para su preparación. La fecha más temprana disponible es: ${fechaMinimaDate.toLocaleDateString('es-ES')}`);
      } else {
        alert(`La fecha seleccionada debe ser al menos 7 días después de hoy. La fecha más temprana disponible es: ${fechaMinimaDate.toLocaleDateString('es-ES')}`);
      }
      return false;
    }
    return true;
  };

  // Función para calcular el precio total del pedido
  const calcularPrecioTotal = () => {
    const PRECIO_POR_LITRO_BIOLOGICO = 38000; // $38,000 COP por litro
    
    if (tipo === 'biologicos') {
      const totalLitros = formData.microorganismosSeleccionados.reduce((total, item) => total + item.cantidad, 0);
      return totalLitros * PRECIO_POR_LITRO_BIOLOGICO;
    }
    
    // Para biochar, no tenemos precio definido aún
    return 0;
  };

  // Función para formatear precio en pesos colombianos
  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  };

  // Funciones para manejo de voz
  const iniciarGrabacion = () => {
    if (!speechSupported) {
      alert('El reconocimiento de voz no está soportado en este navegador. Por favor, usa Chrome o Edge.');
      return;
    }
    
    if (!recognition) {
      alert('Error al inicializar el reconocimiento de voz.');
      return;
    }
    
    setIsRecording(true);
    recognition.start();
  };

  const detenerGrabacion = () => {
    setIsRecording(false);
    if (recognition) {
      recognition.stop();
    }
  };

  const limpiarObservaciones = () => {
    setFormData(prev => ({ ...prev, observaciones: '' }));
  };

  // Función para agregar microorganismo seleccionado desde el dropdown
  const agregarMicroorganismoSeleccionado = () => {
    if (!selectedMicro || !cantidadTemporal || parseFloat(cantidadTemporal) <= 0) {
      alert('Por favor selecciona un microorganismo y especifica una cantidad válida.');
      return;
    }

    const microorganismo = microorganismos.find(m => m.id === selectedMicro);
    if (!microorganismo) return;

    const cantidad = parseFloat(cantidadTemporal);

    setFormData(prev => {
      const nuevosSeleccionados = [
        ...prev.microorganismosSeleccionados,
        {
          microorganismoId: microorganismo.id,
          microorganismoNombre: microorganismo.nombre,
          cantidad: cantidad
        }
      ];

      // Limpiar fecha si se agrega Bacillus thuringiensis para recalcular
      const tieneBacillus = nuevosSeleccionados.some(micro => 
        micro.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
        micro.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
      );
      
      const teniaBacillusAntes = prev.microorganismosSeleccionados.some(micro => 
        micro.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
        micro.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
      );

      return {
        ...prev,
        microorganismosSeleccionados: nuevosSeleccionados,
        // Limpiar fecha si cambió el estado de Bacillus thuringiensis
        fechaEntrega: (tieneBacillus !== teniaBacillusAntes) ? '' : prev.fechaEntrega
      };
    });

    // Limpiar los campos temporales
    setSelectedMicro('');
    setCantidadTemporal('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que haya al menos un microorganismo seleccionado para productos biológicos
    if (tipo === 'biologicos' && formData.microorganismosSeleccionados.length === 0) {
      alert('Debes seleccionar al menos un microorganismo para continuar.');
      return;
    }

    // Validar que se haya seleccionado un producto de biochar
    if (tipo === 'biochar' && !formData.biocharTipo) {
      alert('Debes seleccionar un tipo de biochar para continuar.');
      return;
    }

    // Validar que se haya especificado una cantidad para biochar
    if (tipo === 'biochar' && (!formData.biocharCantidad || parseFloat(formData.biocharCantidad) <= 0)) {
      alert('Debes especificar una cantidad válida para el biochar.');
      return;
    }

    // Validar modalidad de entrega
    if (!formData.recogesPedido) {
      alert('Debes indicar si recoges el pedido o necesitas entrega.');
      return;
    }

    // Validar fecha de entrega (requerida para ambos casos)
    if (!formData.fechaEntrega) {
      alert('Debes especificar una fecha de entrega.');
      return;
    }

    // Validar fecha según microorganismos seleccionados
    if (tipo === 'biologicos' && !validarFechaEntrega(formData.fechaEntrega)) {
      return;
    }

    setIsLoading(true);

    try {
      const requestBody = {
        usuario: user,
        tipo,
        recogesPedido: formData.recogesPedido,
        fechaEntrega: formData.fechaEntrega, // Siempre incluida
        ubicacionAplicacion: formData.ubicacionAplicacion, // Campo de ubicación de aplicación
        observaciones: formData.observaciones,
        ...(tipo === 'biologicos' 
          ? { 
              microorganismosSeleccionados: formData.microorganismosSeleccionados,
              precioTotal: calcularPrecioTotal(),
              precioUnidad: 38000,
              totalLitros: formData.microorganismosSeleccionados.reduce((total, item) => total + item.cantidad, 0)
            }
          : { 
              biocharTipo: formData.biocharTipo,
              biocharCantidad: formData.biocharCantidad,
              biocharUnidad: formData.biocharUnidad
            }
        )
      };

      const response = await fetch('/api/create-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
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
                    <h2 className="text-3xl font-bold text-white mb-2">¡Pedido enviado!</h2>
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
                      Información del producto
                    </h3>

                    {tipo === 'biologicos' ? (
                      <div className="space-y-4">
                        {/* Selector de microorganismo */}
                        <div className="p-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg">
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
                                  className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                >
                                  <option value="" className="text-gray-800">Selecciona un microorganismo</option>
                                  {microorganismos
                                    .filter(micro => 
                                      // Filter out already selected microorganisms
                                      !formData.microorganismosSeleccionados.some(item => item.microorganismoId === micro.id) &&
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
                                Cantidad (litros) *
                              </label>
                              <Input
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="Ej: 1.5"
                                value={cantidadTemporal}
                                onChange={(e) => setCantidadTemporal(e.target.value)}
                                className="w-full bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                              />
                            </div>
                            
                            <div>
                              <Button
                                type="button"
                                onClick={agregarMicroorganismoSeleccionado}
                                disabled={!selectedMicro || !cantidadTemporal || parseFloat(cantidadTemporal) <= 0}
                                className="w-full h-[46px] bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Agregar
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Lista de microorganismos seleccionados */}
                        {formData.microorganismosSeleccionados.length > 0 && (
                          <div className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg p-4">
                            <h4 className="text-white font-medium mb-3 flex items-center">
                              <Package className="mr-2" size={16} />
                              Microorganismos Seleccionados:
                            </h4>
                            <div className="space-y-2">
                              {formData.microorganismosSeleccionados.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg">
                                  <div className="flex-1">
                                    <span className="text-white font-medium">{item.microorganismoNombre}</span>
                                    <div className="text-sm text-white text-opacity-70">
                                      Cantidad: {item.cantidad} L • Precio: {formatearPrecio(item.cantidad * 38000)}
                                    </div>
                                  </div>
                                  <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => removerMicroorganismo(item.microorganismoId)}
                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                                  >
                                    Quitar
                                  </Button>
                                </div>
                              ))}
                              
                              {/* Resumen de totales */}
                              <div className="border-t border-white border-opacity-30 pt-3 mt-3 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-white font-medium">Total litros:</span>
                                  <span className="text-white text-lg font-bold">
                                    {formData.microorganismosSeleccionados.reduce((total, item) => total + item.cantidad, 0).toFixed(1)} L
                                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-white font-medium">Precio por litro:</span>
                                  <span className="text-white">
                                    {formatearPrecio(38000)}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-green-600 bg-opacity-20 rounded-lg border border-green-500 border-opacity-50">
                                  <span className="text-green-100 font-bold text-lg">Total a pagar:</span>
                                  <span className="text-green-100 text-xl font-bold">
                                    {formatearPrecio(calcularPrecioTotal())}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {microorganismos.length === 0 && !loadingMicroorganismos && (
                          <p className="text-yellow-400 text-sm text-center py-4">
                            No se encontraron microorganismos disponibles
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">
                          Producto *
                        </label>
                        {loadingProductosPirolisis ? (
                          <div className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white">
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Cargando productos...
                            </div>
                          </div>
                        ) : (
                          <select
                            value={formData.biocharTipo || ''}
                            onChange={(e) => setBiocharTipo(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          >
                            <option value="" className="text-gray-800">Selecciona un producto</option>
                            {productosPirolisis.map(producto => (
                              <option key={producto.id} value={producto.nombre} className="text-gray-800">
                                {producto.nombre}
                              </option>
                            ))}
                          </select>
                        )}
                        
                        {productosPirolisis.length === 0 && !loadingProductosPirolisis && (
                          <p className="text-yellow-400 text-sm mt-2">
                            No se encontraron productos de pirólisis disponibles
                          </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">
                              Cantidad *
                            </label>
                            <Input
                              type="number"
                              value={formData.biocharCantidad || ''}
                              onChange={(e) => setBiocharCantidad(e.target.value)}
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
                              value={formData.biocharUnidad || 'kg'}
                              onChange={(e) => setBiocharUnidad(e.target.value)}
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
                    )}
                  </div>

                  {/* Modalidad de entrega */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <MapPin className="mr-2" size={20} />
                      Modalidad de Entrega
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-4">
                        ¿Tú recoges el pedido? *
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center p-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg cursor-pointer hover:bg-opacity-20 transition-all duration-200">
                          <input
                            type="radio"
                            name="recogesPedido"
                            value="si"
                            checked={formData.recogesPedido === 'si'}
                            onChange={(e) => handleInputChange('recogesPedido', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                            formData.recogesPedido === 'si' 
                              ? 'border-green-400 bg-green-400' 
                              : 'border-white border-opacity-50'
                          }`}>
                            {formData.recogesPedido === 'si' && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                          <span className="text-white font-medium">Sí, yo recojo</span>
                        </label>
                        
                        <label className="flex items-center p-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-30 rounded-lg cursor-pointer hover:bg-opacity-20 transition-all duration-200">
                          <input
                            type="radio"
                            name="recogesPedido"
                            value="no"
                            checked={formData.recogesPedido === 'no'}
                            onChange={(e) => handleInputChange('recogesPedido', e.target.value)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border-2 mr-3 transition-all duration-200 ${
                            formData.recogesPedido === 'no' 
                              ? 'border-green-400 bg-green-400' 
                              : 'border-white border-opacity-50'
                          }`}>
                            {formData.recogesPedido === 'no' && (
                              <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                            )}
                          </div>
                          <span className="text-white font-medium">No, necesito envío</span>
                        </label>
                      </div>
                    </div>

                    {/* Mostrar campos según la selección */}
                    {formData.recogesPedido && (
                      <div className="space-y-4 mt-4 p-4 bg-white bg-opacity-5 backdrop-blur-sm border border-white border-opacity-20 rounded-lg">
                        {/* Fecha de entrega (siempre requerida) */}
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">
                            {formData.recogesPedido === 'si' ? 'Fecha de recogida *' : 'Fecha de entrega *'}
                          </label>
                          {/* Mostrar aviso especial para Bacillus thuringiensis */}
                          {tipo === 'biologicos' && formData.microorganismosSeleccionados.some(micro => 
                            micro.microorganismoNombre.toLowerCase().includes('bacillus thuringiensis') ||
                            micro.microorganismoNombre.toLowerCase().includes('bacillus thurigenciensis')
                          ) && (
                            <div className="mb-2 p-2 bg-yellow-600 bg-opacity-20 border border-yellow-500 border-opacity-50 rounded-lg">
                              <p className="text-yellow-200 text-sm flex items-center">
                                <span className="mr-2">⚠️</span>
                                Bacillus thuringiensis requiere un mínimo de 4 días hábiles para su preparación
                              </p>
                            </div>
                          )}
                          <Input
                            type="date"
                            value={formData.fechaEntrega}
                            onChange={(e) => handleInputChange('fechaEntrega', e.target.value)}
                            required
                            min={calcularFechaMinima()}
                            className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60"
                          />
                        </div>

                        {/* Información simplificada sobre envío */}
                        {formData.recogesPedido === 'no' && (
                          <div className="bg-blue-500 bg-opacity-20 backdrop-blur-sm border border-blue-500 border-opacity-30 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Package className="h-5 w-5 text-blue-400" />
                              <h3 className="text-lg font-semibold text-blue-400">Envío a Domicilio</h3>
                            </div>
                            <p className="text-white text-sm">
                              Has seleccionado <strong>envío a domicilio</strong>. Nuestro equipo se pondrá en contacto contigo 
                              para coordinar los detalles de entrega y la dirección exacta.
                            </p>
                          </div>
                        )}

                      </div>
                    )}

                    {/* Campo Ubicación Aplicación - visible para todos los casos */}
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Ubicación de Aplicación del Producto
                      </label>
                      <Input
                        type="text"
                        value={formData.ubicacionAplicacion}
                        onChange={(e) => handleInputChange('ubicacionAplicacion', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 text-white placeholder-white placeholder-opacity-60"
                        placeholder="Ej: Finca La Esperanza, Cultivo de café, Zona norte de la propiedad"
                      />
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <FileText className="mr-2" size={20} />
                      Observaciones adicionales
                    </h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">
                        Comentarios (opcional)
                      </label>
                      
                      {isListening && (
                        <div className="mb-2 p-2 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-30 rounded-lg">
                          <div className="flex items-center text-white text-sm">
                            <div className="animate-pulse mr-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            </div>
                            <span>Escuchando... Habla claramente</span>
                          </div>
                        </div>
                      )}
                      
                      <div className="relative">
                        <textarea
                          value={formData.observaciones}
                          onChange={(e) => handleInputChange('observaciones', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-3 pr-12 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-60 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          placeholder="Especificaciones especiales, instrucciones de manejo, etc."
                        />
                        
                        {speechSupported && (
                          <button
                            type="button"
                            onClick={isRecording ? detenerGrabacion : iniciarGrabacion}
                            className={`absolute right-3 top-3 p-2 rounded-full transition-all duration-200 ${
                              isRecording 
                                ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                                : 'bg-white bg-opacity-20 hover:bg-opacity-30 border border-white border-opacity-30'
                            }`}
                          >
                            {isRecording ? (
                              <Square size={16} className="text-white" />
                            ) : (
                              <Mic size={16} className="text-white" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {!speechSupported && (
                        <p className="text-yellow-300 text-xs mt-1">
                          ⚠️ El reconocimiento de voz no está disponible en este navegador. Recomendamos usar Chrome o Edge para mejor experiencia.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Resumen del pedido */}
                  <Card className="bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20">
                    <CardContent className="p-4">
                      <h4 className="font-semibold text-white mb-3">Resumen del pedido</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-white">Cliente:</span>
                          <p className="text-white text-opacity-90">{user?.nombre}</p>
                        </div>
                        <div>
                          <span className="font-medium text-white">Tipo:</span>
                          <p className="text-white text-opacity-90">{tipo === 'biologicos' ? 'Productos biológicos' : 'Biochar'}</p>
                        </div>
                        {tipo === 'biologicos' && formData.microorganismosSeleccionados.length > 0 && (
                          <>
                            <div>
                              <span className="font-medium text-white">Cantidad total:</span>
                              <p className="text-white text-opacity-90">
                                {formData.microorganismosSeleccionados.reduce((total, item) => total + item.cantidad, 0).toFixed(1)} litros
                              </p>
                            </div>
                            <div>
                              <span className="font-medium text-white">Precio por Litro:</span>
                              <p className="text-white text-opacity-90">{formatearPrecio(38000)}</p>
                            </div>
                            <div className="border-t border-white border-opacity-30 pt-2 mt-2">
                              <span className="font-medium text-white">Valor total:</span>
                              <p className="text-green-300 text-lg font-bold">{formatearPrecio(calcularPrecioTotal())}</p>
                            </div>
                          </>
                        )}
                        {tipo === 'biochar' && formData.biocharTipo && (
                          <div>
                            <span className="font-medium text-white">Producto:</span>
                            <p className="text-white text-opacity-90">{formData.biocharTipo} - {formData.biocharCantidad} {formData.biocharUnidad}</p>
                          </div>
                        )}
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
                      {isLoading ? 'Enviando pedido...' : 'Enviar pedido'}
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

export default function PedidoPage() {
  return (
    <Suspense fallback={
      <div 
        className="min-h-screen py-12 relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-white">Cargando...</p>
        </div>
      </div>
    }>
      <PedidoContent />
    </Suspense>
  );
}
