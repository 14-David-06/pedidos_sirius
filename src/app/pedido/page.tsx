'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Package, User, Hash } from 'lucide-react';

interface FormData {
  cedula: string;
  cantidad: string;
  unidadMedida: 'BigBag' | 'Lona' | 'Otro';
  unidadPersonalizada: string;
}

interface FormErrors {
  cedula?: string;
  cantidad?: string;
  unidadPersonalizada?: string;
  general?: string;
}

export default function PedidoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    cedula: '',
    cantidad: '',
    unidadMedida: 'BigBag',
    unidadPersonalizada: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [cedulaValidated, setCedulaValidated] = useState(false);
  const [clienteInfo, setClienteInfo] = useState<any>(null);
  const [showValidationMessage, setShowValidationMessage] = useState(false);

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

      const data = await response.json();
      return {
        isValid: data.isValid,
        cliente: data.cliente
      };
    } catch (error) {
      console.error('Error validating cedula:', error);
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
    
    // Validar cédula en tiempo real con debounce
    if (name === 'cedula') {
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(false);
      
      // Debounce: validar después de 1.5 segundos de inactividad
      setTimeout(() => {
        validateCedulaRealTime(value);
      }, 1500);
    }
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Función para validar cédula en tiempo real
  const validateCedulaRealTime = async (cedula: string) => {
    if (!cedula || cedula.length < 6) {
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(false);
      return;
    }

    if (!validateCedula(cedula)) {
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(false);
      return;
    }

    setIsValidating(true);
    setShowValidationMessage(false);
    
    try {
      const result = await checkCedulaInAirtable(cedula);
      
      if (result.isValid) {
        setCedulaValidated(true);
        setClienteInfo(result.cliente);
        setErrors(prev => ({ ...prev, cedula: '' }));
      } else {
        setCedulaValidated(false);
        setClienteInfo(null);
      }
      setShowValidationMessage(true);
    } catch (error) {
      setCedulaValidated(false);
      setClienteInfo(null);
      setShowValidationMessage(true);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
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
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <img 
              src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
              alt="Sirius Logo" 
              className="h-16 w-auto"
            />
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

              {isValidating && formData.cedula && (
                <div className="flex items-center space-x-2 mt-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  <p className="text-sm text-gray-600">Validando cédula...</p>
                </div>
              )}

              {showValidationMessage && !isValidating && (
                <div className="mt-2">
                  {cedulaValidated ? (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium">
                        ¡Hola {clienteInfo?.Nombre || 'Cliente'}! 
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Tu cédula está registrada en nuestro sistema. Pronto te avisaremos sobre tu pedido.
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
                      <p className="text-sm text-green-800 font-medium mt-1">
                        Cantidad solicitada: {formData.cantidad} kg en {
                          formData.unidadMedida === 'Otro' 
                            ? formData.unidadPersonalizada 
                            : formData.unidadMedida
                        }
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                type="submit" 
                className={`w-full ${cedulaValidated ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
                size="lg"
                disabled={isLoading || isValidating || !cedulaValidated}
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
