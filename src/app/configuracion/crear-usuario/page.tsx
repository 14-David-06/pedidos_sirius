'use client';
import logger from '@/lib/logger';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  ArrowLeft, 
  UserPlus,
  User,
  Mail,
  Shield,
  FileText,
  Building,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface FormData {
  nombreCompleto: string;
  tipoDocumento: string;
  numeroDocumento: string;
  areaEmpresa: string;
  areaPersonalizada: string;
  rolUsuario: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CrearUsuarioPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: '',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    areaEmpresa: 'Administración',
    areaPersonalizada: '',
    rolUsuario: 'Visualizacion'
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const tiposDocumento = [
    { value: 'CC', label: 'Cédula de Ciudadanía' },
    { value: 'CE', label: 'Cédula de Extranjería' },
    { value: 'TI', label: 'Tarjeta de Identidad' },
    { value: 'PP', label: 'Pasaporte' }
  ];

  const roles = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Compras', label: 'Compras' },
    { value: 'Visualizacion', label: 'Visualización' }
  ];

  const areasEmpresa = [
    { value: 'Administración', label: 'Administración' },
    { value: 'Compras', label: 'Compras' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Ventas', label: 'Ventas' },
    { value: 'Contabilidad', label: 'Contabilidad' },
    { value: 'Recursos Humanos', label: 'Recursos Humanos' },
    { value: 'Producción', label: 'Producción' },
    { value: 'Calidad', label: 'Calidad' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Sistemas', label: 'Sistemas/IT' },
    { value: 'Otro', label: 'Otro (especificar)' }
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = 'El nombre completo es requerido';
    }

    if (!formData.numeroDocumento.trim()) {
      newErrors.numeroDocumento = 'El número de documento es requerido';
    }

    if (!formData.areaEmpresa) {
      newErrors.areaEmpresa = 'El área de la empresa es requerida';
    }

    // Si seleccionó "Otro", validar que haya escrito el área personalizada
    if (formData.areaEmpresa === 'Otro' && !formData.areaPersonalizada.trim()) {
      newErrors.areaPersonalizada = 'Por favor especifique el área de la empresa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Determinar qué área enviar
      const areaFinal = formData.areaEmpresa === 'Otro' ? formData.areaPersonalizada : formData.areaEmpresa;
      
      const response = await fetch('/api/usuarios/crear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Root-Id': user?.id || ''
        },
        body: JSON.stringify({
          ...formData,
          areaEmpresa: areaFinal
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear el usuario');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/configuracion/usuarios');
      }, 2000);

    } catch (error) {
      logger.errorSafe('Error creating user:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar que el usuario sea de tipo raíz o Admin
  if (user && user.tipoUsuario !== 'raiz' && user.rol !== 'Admin') {
    router.push('/dashboard');
    return null;
  }

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
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="pt-20">
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
                  <h2 className="text-2xl font-bold text-white mb-2">¡Usuario Creado Exitosamente!</h2>
                  <p className="text-white text-opacity-80 mb-6">
                    El empleado ha sido registrado correctamente en su empresa.
                  </p>
                  <p className="text-white text-opacity-60 text-sm">
                    Redirigiendo a la lista de usuarios...
                  </p>
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
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/configuracion/usuarios"
                className="inline-flex items-center text-white hover:text-blue-400 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver a Usuarios
              </Link>
              
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-3 rounded-full backdrop-blur-sm">
                      <UserPlus className="text-white" size={24} />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">Crear Nuevo Empleado</h1>
                      <p className="text-white text-opacity-90">Registrar un nuevo usuario en su empresa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Error message */}
            {error && (
              <Card className="bg-red-500 bg-opacity-20 backdrop-blur-md shadow-lg mb-6 border border-red-400 border-opacity-50">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 text-red-200">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Formulario */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <User size={20} className="mr-2" />
                      Información Personal
                    </h3>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Nombre Completo *
                      </label>
                      <Input
                        type="text"
                        value={formData.nombreCompleto}
                        onChange={(e) => handleInputChange('nombreCompleto', e.target.value)}
                        className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                        placeholder="Ingrese nombre completo"
                      />
                      {errors.nombreCompleto && (
                        <p className="text-red-400 text-sm mt-1">{errors.nombreCompleto}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Tipo de Documento *
                        </label>
                        <select
                          value={formData.tipoDocumento}
                          onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
                          className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:border-blue-400"
                        >
                          {tiposDocumento.map(tipo => (
                            <option key={tipo.value} value={tipo.value} className="bg-gray-800 text-white">
                              {tipo.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Número de Documento *
                        </label>
                        <Input
                          type="text"
                          value={formData.numeroDocumento}
                          onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Número de documento"
                        />
                        {errors.numeroDocumento && (
                          <p className="text-red-400 text-sm mt-1">{errors.numeroDocumento}</p>
                        )}
                        <p className="text-blue-200 text-sm mt-1">
                          💡 El empleado usará este número de documento para iniciar sesión
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información Empresarial */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Building size={20} className="mr-2" />
                      Información Empresarial
                    </h3>
                    
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Área de la Empresa *
                      </label>
                      <select
                        value={formData.areaEmpresa}
                        onChange={(e) => handleInputChange('areaEmpresa', e.target.value)}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        {areasEmpresa.map(area => (
                          <option key={area.value} value={area.value} className="bg-gray-800 text-white">
                            {area.label}
                          </option>
                        ))}
                      </select>
                      {errors.areaEmpresa && (
                        <p className="text-red-400 text-sm mt-1">{errors.areaEmpresa}</p>
                      )}
                    </div>

                    {/* Campo de área personalizada - solo se muestra si selecciona "Otro" */}
                    {formData.areaEmpresa === 'Otro' && (
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Especificar Área *
                        </label>
                        <Input
                          type="text"
                          value={formData.areaPersonalizada}
                          onChange={(e) => handleInputChange('areaPersonalizada', e.target.value)}
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Escriba el área específica"
                        />
                        {errors.areaPersonalizada && (
                          <p className="text-red-400 text-sm mt-1">{errors.areaPersonalizada}</p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Rol de Usuario *
                      </label>
                      <select
                        value={formData.rolUsuario}
                        onChange={(e) => handleInputChange('rolUsuario', e.target.value)}
                        className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white focus:outline-none focus:border-blue-400"
                      >
                        {roles.map(rol => (
                          <option key={rol.value} value={rol.value} className="bg-gray-800 text-white">
                            {rol.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creando Usuario...
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-2" />
                          Crear Empleado
                        </>
                      )}
                    </Button>
                    
                    <Link href="/configuracion/usuarios">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30"
                      >
                        Cancelar
                      </Button>
                    </Link>
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

