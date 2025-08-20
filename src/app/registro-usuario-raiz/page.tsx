'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, UserPlus, Shield } from 'lucide-react';

export default function RegistroUsuarioRaizPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Datos de departamentos y municipios de Colombia (versión reducida para este formulario)
  const departamentosMunicipios = {
    "Meta": ["Villavicencio", "Acacías", "Granada", "San Martín", "Puerto López", "Cumaral", "Restrepo"],
    "Cundinamarca": ["Bogotá", "Soacha", "Fusagasugá", "Facatativá", "Zipaquirá", "Chía", "Mosquera"],
    "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro"],
    "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Jamundí"]
  };

  const [formData, setFormData] = useState({
    nombreRazonSocial: '',
    tipoDocumento: '',
    documento: '',
    usuario: '',
    ciudad: '',
    departamento: '',
    direccion: '',
    // Información de Contacto - Área Contable
    nombreContable: '',
    telefonoContable: '',
    emailContable: '',
    // Información de Contacto - Área Tesorería
    nombreTesoreria: '',
    telefonoTesoreria: '',
    emailTesoreria: '',
    // Información de Contacto - Área Compras
    nombreCompras: '',
    telefonoCompras: '',
    emailCompras: '',
    contribuyente: '',
    tipoCultivo: '',
    tipoCultivoOtro: '',
    rutFile: null as File | null,
    camaraComercioFile: null as File | null,
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState<string[]>([]);

  // Verificar que el usuario sea de tipo raíz
  if (!user || user.tipoUsuario !== 'raiz') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
            <p className="text-gray-600 mb-4">
              Solo los usuarios raíz pueden acceder a esta funcionalidad.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el departamento, actualizar los municipios disponibles
    if (name === 'departamento') {
      setMunicipiosDisponibles(departamentosMunicipios[value as keyof typeof departamentosMunicipios] || []);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ciudad: '' // Limpiar la ciudad cuando cambie el departamento
      }));
    } else if (name === 'tipoCultivo' && value !== 'Otro') {
      // Si cambia el tipo de cultivo y no es "Otro", limpiar el campo personalizado
      setFormData(prev => ({
        ...prev,
        [name]: value,
        tipoCultivoOtro: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({
      ...prev,
      [fieldName]: file
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setIsLoading(false);
      return;
    }

    // Validar que al menos un área de contacto esté completa
    const areaContable = formData.nombreContable && formData.telefonoContable && formData.emailContable;
    const areaTesoreria = formData.nombreTesoreria && formData.telefonoTesoreria && formData.emailTesoreria;
    const areaCompras = formData.nombreCompras && formData.telefonoCompras && formData.emailCompras;
    
    if (!areaContable && !areaTesoreria && !areaCompras) {
      setError('Debe completar al menos un área de contacto (Contable, Tesorería o Compras)');
      setIsLoading(false);
      return;
    }

    try {
      // Crear FormData para envío
      const submitFormData = new FormData();
      
      // Agregar todos los campos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            submitFormData.append(key, value);
          } else {
            submitFormData.append(key, String(value));
          }
        }
      });

      // Enviar a la API específica para usuarios raíz
      const response = await fetch('/api/registro-usuario-raiz', {
        method: 'POST',
        body: submitFormData
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al registrar el usuario raíz');
        setIsLoading(false);
        return;
      }

      // Registro exitoso
      alert('Usuario Raíz registrado exitosamente');
      router.push('/configuracion');

    } catch (error) {
      console.error('Error:', error);
      setError('Error de conexión. Inténtelo de nuevo.');
      setIsLoading(false);
    }
  };

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
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="pt-20">
            {/* Header */}
            <div className="mb-8">
              <Link 
                href="/configuracion"
                className="inline-flex items-center text-white hover:text-purple-400 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} className="mr-2" />
                Volver a Configuración
              </Link>
              
              <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
                <CardContent className="p-8">
                  <div className="flex items-center space-x-4">
                    <div className="bg-white bg-opacity-20 p-4 rounded-full backdrop-blur-sm">
                      <UserPlus className="text-white" size={32} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Registro de Usuario Raíz</h1>
                      <p className="text-white text-opacity-90">Crear un nuevo usuario con privilegios de administrador</p>
                    </div>
                  </div>
                  <div className="mt-4 inline-flex items-center space-x-2 bg-yellow-500 bg-opacity-20 backdrop-blur-sm text-yellow-200 border border-yellow-400 border-opacity-50 px-4 py-2 rounded-full">
                    <Shield size={16} />
                    <span className="text-sm font-bold">PRIVILEGIOS ADMINISTRATIVOS COMPLETOS</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulario */}
            <Card className="bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-20">
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {error && (
                    <div className="bg-red-500 bg-opacity-20 backdrop-blur-sm border border-red-400 border-opacity-50 text-red-200 p-4 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Información Básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white border-opacity-30 pb-2">
                      Información Básica
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Nombre o Razón Social *
                        </label>
                        <Input
                          type="text"
                          name="nombreRazonSocial"
                          value={formData.nombreRazonSocial}
                          onChange={handleInputChange}
                          required
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Ingrese el nombre completo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Usuario *
                        </label>
                        <Input
                          type="text"
                          name="usuario"
                          value={formData.usuario}
                          onChange={handleInputChange}
                          required
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Nombre de usuario"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Tipo Documento *
                        </label>
                        <select
                          name="tipoDocumento"
                          value={formData.tipoDocumento}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="" className="text-gray-900">Seleccionar</option>
                          <option value="CC" className="text-gray-900">Cédula de Ciudadanía</option>
                          <option value="NIT" className="text-gray-900">NIT</option>
                          <option value="CE" className="text-gray-900">Cédula de Extranjería</option>
                          <option value="Pasaporte" className="text-gray-900">Pasaporte</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Número Documento *
                        </label>
                        <Input
                          type="text"
                          name="documento"
                          value={formData.documento}
                          onChange={handleInputChange}
                          required
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Número de documento"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Departamento
                        </label>
                        <select
                          name="departamento"
                          value={formData.departamento}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="" className="text-gray-900">Seleccionar Departamento</option>
                          {Object.keys(departamentosMunicipios).map(dept => (
                            <option key={dept} value={dept} className="text-gray-900">{dept}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Ciudad
                        </label>
                        <select
                          name="ciudad"
                          value={formData.ciudad}
                          onChange={handleInputChange}
                          disabled={!formData.departamento}
                          className="w-full px-3 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                        >
                          <option value="" className="text-gray-900">Seleccionar Ciudad</option>
                          {municipiosDisponibles.map(ciudad => (
                            <option key={ciudad} value={ciudad} className="text-gray-900">{ciudad}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Dirección
                        </label>
                        <Input
                          type="text"
                          name="direccion"
                          value={formData.direccion}
                          onChange={handleInputChange}
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Dirección completa"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contraseñas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-white border-opacity-30 pb-2">
                      Configuración de Acceso
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Contraseña *
                        </label>
                        <Input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-white mb-1">
                          Confirmar Contraseña *
                        </label>
                        <Input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white placeholder-white placeholder-opacity-70"
                          placeholder="Repetir contraseña"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botón de envío */}
                  <div className="flex justify-end space-x-4 pt-6">
                    <Link href="/configuracion">
                      <Button 
                        type="button" 
                        variant="outline"
                        className="bg-white bg-opacity-20 backdrop-blur-sm border-white border-opacity-30 text-white hover:bg-opacity-30"
                      >
                        Cancelar
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Registrando...
                        </>
                      ) : (
                        <>
                          <UserPlus size={16} className="mr-2" />
                          Registrar Usuario Raíz
                        </>
                      )}
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
