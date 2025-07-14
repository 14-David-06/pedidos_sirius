'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { LoadingSpinner } from '@/components/ui/Loading';
import { Mail, Lock } from 'lucide-react';
import { validateEmail } from '@/lib/utils';
import type { LoginFormData, FormErrors } from '@/types';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simular autenticación
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // En una implementación real, aquí harías la llamada a la API
      console.log('Login attempt:', formData);
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } catch (error) {
      setErrors({ general: 'Error al iniciar sesión. Intenta de nuevo.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative"
      style={{
        backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167375/IMG_0497_1_jcvtji.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
      
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white bg-opacity-95 rounded-2xl p-4 shadow-lg">
              <img 
                src="https://res.cloudinary.com/dvnuttrox/image/upload/v1747945175/logo_siris-removebg-preview_psxwgc.png" 
                alt="Sirius Logo" 
                className="h-16 w-auto mx-auto"
              />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-white drop-shadow-md">
            Accede a tu cuenta de Sirius Solutions
          </p>
        </div>

        {/* Formulario */}
        <Card className="shadow-2xl bg-white bg-opacity-95 backdrop-blur-sm border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para continuar
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
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={<Mail className="h-4 w-4" />}
                placeholder="tu@email.com"
                disabled={isLoading}
              />

              <Input
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                icon={<Lock className="h-4 w-4" />}
                placeholder="••••••••"
                disabled={isLoading}
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  label="Recordarme"
                  disabled={isLoading}
                />
                
                <Link 
                  href="/forgot-password" 
                  className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    ¿No tienes cuenta?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link href="/register">
                  <Button variant="outline" className="w-full">
                    Crear cuenta nueva
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
