'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Package, User, Hash } from 'lucide-react';

interface FormData {
  cedula: string;
  cantidad: string;
  unidadMedida: 'BigBag' | 'Lona' | 'Otro';
  unidadPersonalizada: string;
  destino: string;
}

interface FormErrors {
  cedula?: string;
  cantidad?: string;
  unidadPersonalizada?: string;
  usoResponsable?: string;
  politicasPrivacidad?: string;
  general?: string;
}

export default function PedidoPage() {
  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [formData, setFormData] = useState<FormData>({
    cedula: '',
    cantidad: '',
    unidadMedida: 'BigBag',
    unidadPersonalizada: '',
    destino: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [cedulaValidated, setCedulaValidated] = useState(false);
  const [clienteInfo, setClienteInfo] = useState<any>(null);
  const [showValidationMessage, setShowValidationMessage] = useState(false);
  const [aceptaUsoResponsable, setAceptaUsoResponsable] = useState(false);
  const [aceptaPoliticasPrivacidad, setAceptaPoliticasPrivacidad] = useState(false);

  // Limpiar debounce al desmontar el componente
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const validateCedula = (cedula: string): boolean => {
    // Validar que solo contenga números
    if (!/^\d+$/.test(cedula)) {
      return false;
    }
    
    // Validar longitud (entre 6 y 10 dígitos para Colombia)
    if (cedula.length < 6 || cedula.length > 10) {
      return false;
    }
    
    return true;
  };

  // Función para calcular cantidad de unidades y precio
  const calculateUnits = () => {
    const cantidad = Number(formData.cantidad);
    if (!cantidad || cantidad <= 0) return { bigbags: 0, lonas: 0, precioTotal: 0 };
    
    const bigbags = Math.ceil(cantidad / 600); // 600kg por BigBag
    const lonas = Math.ceil(cantidad / 35);    // 35kg por Lona
    const precioTotal = cantidad * 1190;       // $1.190 COP por kg
    
    return { bigbags, lonas, precioTotal };
  };

  const { bigbags, lonas, precioTotal } = calculateUnits();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.cedula) {
      newErrors.cedula = 'La cédula es requerida';
    } else if (!validateCedula(formData.cedula)) {
      newErrors.cedula = 'Ingresa una cédula válida (6-10 dígitos)';
    }

    if (!formData.cantidad) {
      newErrors.cantidad = 'La cantidad es requerida';
    } else if (isNaN(Number(formData.cantidad)) || Number(formData.cantidad) <= 0) {
      newErrors.cantidad = 'Ingresa una cantidad válida en kilogramos (mayor a 0)';
    }

    if (formData.unidadMedida === 'Otro' && !formData.unidadPersonalizada.trim()) {
      newErrors.unidadPersonalizada = 'Especifica la unidad de medida personalizada';
    }

    if (!aceptaUsoResponsable) {
      newErrors.usoResponsable = 'Debes aceptar el compromiso de uso responsable del biochar';
    }

    if (!aceptaPoliticasPrivacidad) {
      newErrors.politicasPrivacidad = 'Debes aceptar las políticas de privacidad';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCedulaInAirtable = async (cedula: string): Promise<{isValid: boolean, cliente?: any}> => {
    try {
      const response = await fetch('/api/validate-cedula', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cedula }),
      });

      if (!response.ok) {
        return { isValid: false };
      }

      const data = await response.json();
      
      return {
        isValid: data.isValid,
        cliente: data.cliente
      };
    } catch (error) {
      return { isValid: false };
    }
  };

  const submitPedido = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/create-pedido', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      return response.ok;
    } catch (error) {
      console.error('Error creating pedido:', error);
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Verificar que la cédula esté validada
    if (!cedulaValidated) {
      setErrors({ 
        cedula: 'La cédula no está validada. Verifica que esté registrada en nuestro sistema.' 
      });
      return;
    }

    setIsLoading(true);
    setErrors({});
    
    try {
      // Crear pedido directamente ya que la cédula está validada
      const success = await submitPedido();
      
      if (success) {
        // Redirigir a página de confirmación
        router.push('/pedido/confirmacion');
      } else {
        setErrors({ 
          general: 'Error al procesar el pedido. Intenta de nuevo.' 
        });
      }
    } catch (error) {
      setErrors({ 
        general: 'Error de conexión. Verifica tu internet e intenta de nuevo.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Si cambia la unidad de medida y no es "Otro", limpiar el campo personalizado
    if (name === 'unidadMedida' && value !== 'Otro') {
      setFormData(prev => ({
        ...prev,
        unidadPersonalizada: ''
      }));
    }
    
    // Validar cédula solo cuando termine de escribir
    if (name === 'cedula') {
      console.log('=== CAMBIO EN CÉDULA ===');
      console.log('Nuevo valor:', value);
      console.log('Longitud:', value.length);
      console.log('Es válida?', validateCedula(value));
      
      // Limpiar estado anterior
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(false);
      
      // Cancelar validación anterior si existe
      if (debounceRef.current) {
        console.log('Cancelando validación anterior');
        clearTimeout(debounceRef.current);
      }
      
      // Solo validar si la cédula cumple los requisitos mínimos
      if (value.length >= 6 && validateCedula(value)) {
        console.log('Configurando debounce para validación en 1.5 segundos...');
        // Configurar nueva validación con debounce de 1.5 segundos
        debounceRef.current = setTimeout(() => {
          console.log('¡Ejecutando validación desde debounce!');
          validateCedulaRealTime(value);
        }, 1500);
      } else {
        console.log('Cédula no cumple requisitos mínimos, no se validará');
      }
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para validar cédula cuando el usuario termine de escribir
  const validateCedulaRealTime = async (cedula: string) => {
    console.log('=== INICIANDO VALIDACIÓN DE CÉDULA ===');
    console.log('Cédula a validar:', cedula);

    if (!validateCedula(cedula)) {
      console.log('Cédula no pasa validación de formato local');
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(false);
      return;
    }

    console.log('Formato de cédula válido, consultando en Airtable...');
    setIsValidating(true);
    setShowValidationMessage(false);
    
    try {
      const result = await checkCedulaInAirtable(cedula);
      console.log('Resultado de validación Airtable:', result);
      
      if (result.isValid) {
        console.log('✅ Cédula VÁLIDA - Cliente encontrado');
        setCedulaValidated(true);
        setClienteInfo(result.cliente);
        setErrors(prev => ({ ...prev, cedula: '' }));
      } else {
        console.log('❌ Cédula NO VÁLIDA - Cliente no encontrado');
        setCedulaValidated(false);
        setClienteInfo(null);
      }
      setShowValidationMessage(true);
    } catch (error) {
      console.error('Error en validación:', error);
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(true);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167074/20032025-DSC_3427_1_1_zmq71m.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0"
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
        onError={(e) => {
          console.log('Video error, using fallback background image');
          e.currentTarget.style.display = 'none';
        }}
      >
        <source src="https://res.cloudinary.com/dvnuttrox/video/upload/f_mp4,q_auto:good,w_1920/v1752585561/Corte_pedidos_biochar_f4fhed.mov" type="video/mp4" />
        <source src="https://res.cloudinary.com/dvnuttrox/video/upload/f_webm,q_auto:good,w_1920/v1752585561/Corte_pedidos_biochar_f4fhed.mov" type="video/webm" />
        <source src="https://res.cloudinary.com/dvnuttrox/video/upload/v1752585561/Corte_pedidos_biochar_f4fhed.mov" type="video/quicktime" />
        Su navegador no soporta video HTML5.
      </video>
      
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-10"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-20">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <br /><br />
          </div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Solicitar Biochar Blend
          </h2>
          <p className="mt-2 text-white drop-shadow-md">
            Completa el formulario para realizar tu pedido
          </p>
        </div>

        {/* Formulario */}
        <Card className="shadow-2xl bg-white bg-opacity-95 backdrop-blur-sm border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-green-800">Nuevo Pedido</CardTitle>
            <CardDescription className="text-center">
              Ingresa los datos para procesar tu solicitud
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <Input
                label="Número de Cédula"
                name="cedula"
                type="text"
                value={formData.cedula}
                onChange={handleChange}
                error={errors.cedula}
                icon={<User className="h-4 w-4" />}
                placeholder="Ej: 12345678"
                disabled={isLoading}
              />

              {/* Indicador de validación en progreso */}
              {isValidating && formData.cedula && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <p className="text-sm text-gray-600">Validando cédula en el sistema...</p>
                </div>
              )}

              {/* Resultado de la validación */}
              {showValidationMessage && !isValidating && (
                <div className="mt-2">
                  {cedulaValidated ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ¡Hola {clienteInfo?.['Nombre Solicitante'] || 'Cliente'}! 
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Tu cédula está registrada en nuestro sistema.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800 font-medium">
                        Cédula no encontrada en el sistema
                      </p>
                      <p className="text-sm text-red-600 mt-1">
                        Por favor acércate a soporte técnico para ser registrado antes de realizar tu pedido.
                      </p>
                      <a 
                        href="https://sirius-landing.vercel.app/contacto" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm text-red-700 hover:text-red-800 underline"
                      >
                        Contactar Soporte Técnico →
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Unidad de Medida
                </label>
                <select
                  name="unidadMedida"
                  value={formData.unidadMedida}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  disabled={isLoading}
                >
                  <option value="BigBag">BigBag</option>
                  <option value="Lona">Lona</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {formData.unidadMedida === 'Otro' && (
                <Input
                  label="Especifica la unidad de medida"
                  name="unidadPersonalizada"
                  type="text"
                  value={formData.unidadPersonalizada}
                  onChange={handleChange}
                  error={errors.unidadPersonalizada}
                  icon={<Package className="h-4 w-4" />}
                  placeholder="Ej: Sacos de 25kg, Contenedores, etc."
                  disabled={isLoading}
                />
              )}

              <Input
                label="Cantidad (en kilogramos)"
                name="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={handleChange}
                error={errors.cantidad}
                icon={<Hash className="h-4 w-4" />}
                placeholder="Ej: 500 (kilogramos)"
                disabled={isLoading}
                min="1"
              />

              <Input
                label="Destino (Opcional)"
                name="destino"
                type="text"
                value={formData.destino}
                onChange={handleChange}
                icon={<Package className="h-4 w-4" />}
                placeholder="Ej: Finca La Esperanza, Cultivo de Aguacate, etc."
                disabled={isLoading}
              />

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <Package className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800">
                      {formData.unidadMedida === 'Otro' 
                        ? `Unidad Personalizada: ${formData.unidadPersonalizada || 'Por especificar'}`
                        : `${formData.unidadMedida} Seleccionado`
                      }
                    </h4>
                    <p className="text-sm text-green-700">
                      {formData.unidadMedida === 'BigBag' 
                        ? 'Ideal para proyectos industriales y agricultura extensiva'
                        : formData.unidadMedida === 'Lona'
                        ? 'Perfecto para jardines y proyectos de mediana escala'
                        : 'Unidad de medida personalizada según tus necesidades'
                      }
                    </p>
                    {formData.cantidad && (
                      <div className="text-sm text-green-800 font-medium mt-1">
                        <p>
                          Cantidad solicitada: {formData.cantidad} kg en {
                            formData.unidadMedida === 'Otro' 
                              ? formData.unidadPersonalizada 
                              : formData.unidadMedida
                          }
                        </p>
                        {formData.unidadMedida === 'BigBag' && bigbags > 0 && (
                          <p className="text-green-700 mt-1">
                            ≈ {bigbags} BigBag{bigbags > 1 ? 's' : ''} (600 kg c/u)
                          </p>
                        )}
                        {formData.unidadMedida === 'Lona' && lonas > 0 && (
                          <p className="text-green-700 mt-1">
                            ≈ {lonas} Lona{lonas > 1 ? 's' : ''} (35 kg c/u)
                          </p>
                        )}
                        <p className="text-green-800 font-bold mt-2 text-base">
                          💰 Total: ${precioTotal.toLocaleString('es-CO')} COP
                        </p>
                        <p className="text-green-600 text-xs mt-1">
                          Precio por kg: $1.190 COP
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkboxes obligatorios */}
              <div className="space-y-4 mb-6">
                {/* Uso Responsable del Biochar */}
                <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="uso-responsable"
                      checked={aceptaUsoResponsable}
                      onChange={(e) => {
                        setAceptaUsoResponsable(e.target.checked);
                        if (errors.usoResponsable) {
                          setErrors({...errors, usoResponsable: undefined});
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="uso-responsable" className="block text-sm font-medium text-green-800 mb-2 cursor-pointer">
                        Uso Responsable del Biochar *
                      </label>
                      <div className="text-xs text-green-700 space-y-1">
                        <p>El biochar entregado está destinado exclusivamente a fines agrícolas y regenerativos. Se espera que:</p>
                        <ul className="list-disc list-inside space-y-0.5 ml-2">
                          <li>No sea quemado ni utilizado como combustible.</li>
                          <li>Sea aplicado al suelo para mejorar su fertilidad, retención de agua y salud microbiana.</li>
                          <li>Contribuya activamente a la remoción de CO₂ de la atmósfera y mitigación del cambio climático.</li>
                        </ul>
                        <p className="font-medium">Quemar este producto anula su impacto ambiental positivo y contradice los principios de la agricultura regenerativa. Gracias por hacer parte de la solución.</p>
                      </div>
                    </div>
                  </div>
                  {errors.usoResponsable && (
                    <p className="text-red-500 text-xs mt-2 ml-8">{errors.usoResponsable}</p>
                  )}
                </div>

                {/* Políticas de Privacidad */}
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="politicas-privacidad"
                      checked={aceptaPoliticasPrivacidad}
                      onChange={(e) => {
                        setAceptaPoliticasPrivacidad(e.target.checked);
                        if (errors.politicasPrivacidad) {
                          setErrors({...errors, politicasPrivacidad: undefined});
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <label htmlFor="politicas-privacidad" className="block text-sm font-medium text-blue-800 cursor-pointer">
                        Acepto las{' '}
                        <a 
                          href="https://sirius-landing.vercel.app/privacypolicy" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 underline"
                        >
                          Políticas de Privacidad
                        </a>
                        {' '}*
                      </label>
                    </div>
                  </div>
                  {errors.politicasPrivacidad && (
                    <p className="text-red-500 text-xs mt-2 ml-8">{errors.politicasPrivacidad}</p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full ${cedulaValidated && aceptaUsoResponsable && aceptaPoliticasPrivacidad ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                size="lg"
                disabled={isLoading || isValidating || !cedulaValidated || !aceptaUsoResponsable || !aceptaPoliticasPrivacidad}
              >
                {isValidating ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Validando cédula...
                  </>
                ) : isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Procesando pedido...
                  </>
                ) : !cedulaValidated ? (
                  'Valida tu cédula primero'
                ) : !aceptaUsoResponsable || !aceptaPoliticasPrivacidad ? (
                  'Acepta los términos para continuar'
                ) : (
                  'Enviar Pedido'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Necesitas ayuda?{' '}
                <a 
                  href="https://sirius-landing.vercel.app/contacto" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Contacta nuestro equipo
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
