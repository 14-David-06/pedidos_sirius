'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useAuth();
  const [formData, setFormData] = useState({
    usuario: '',
    password: '',
    newPassword: '',
    confirmPassword: '',
    tipoUsuario: 'raiz' // por defecto usuario root
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [hasCheckedFirstLogin, setHasCheckedFirstLogin] = useState(false);
  const [foundUserName, setFoundUserName] = useState('');

  // Redirigir si el usuario ya está logueado
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Limpiar URL de parámetros sensibles al cargar la página
  useEffect(() => {
    // Si hay parámetros en la URL, limpiarlos por seguridad
    if (typeof window !== 'undefined' && window.location.search) {
      console.log('🔒 [SECURITY] Limpiando parámetros sensibles de la URL');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el tipo de usuario, limpiar los campos
    if (name === 'tipoUsuario') {
      setFormData({
        usuario: '',
        password: '',
        newPassword: '',
        confirmPassword: '',
        tipoUsuario: value
      });
      setShowPasswordSetup(false);
      setIsFirstLogin(false);
      setHasCheckedFirstLogin(false);
      setFoundUserName('');
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error cuando el usuario comience a escribir
    if (error) setError('');
  };

  // Función para verificar si es primer login (solo para usuarios regulares)
  const checkFirstLogin = async () => {
    if (formData.tipoUsuario !== 'regular' || !formData.usuario.trim()) {
      return;
    }

    setIsLoading(true);
    setError('');

    console.log('🔍 [FRONTEND] Verificando si es primer login para documento:', formData.usuario.trim());
    console.log('📝 [FRONTEND] Enviando datos:', {
      documento: formData.usuario.trim(),
      endpoint: '/api/check-first-login'
    });

    try {
      const response = await fetch('/api/check-first-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento: formData.usuario.trim()
        })
      });

      console.log('📡 [FRONTEND] Respuesta HTTP check-first-login:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      const result = await response.json();
      console.log('📋 [FRONTEND] Respuesta completa del servidor:', result);

      if (response.ok) {
        console.log('✅ [FRONTEND] Resultado verificación exitoso:', {
          isFirstLogin: result.isFirstLogin,
          userFound: !!result.userData,
          userName: result.userData?.nombre,
          userData: result.userData
        });

        // Guardar el nombre del usuario encontrado
        if (result.userData?.nombre) {
          setFoundUserName(result.userData.nombre);
        }

        if (result.isFirstLogin) {
          // Es primer login - mostrar campos para crear contraseña
          setIsFirstLogin(true);
          setShowPasswordSetup(true);
          setHasCheckedFirstLogin(true);
          console.log('🆕 [FRONTEND] Primer login detectado - solicitando creación de contraseña');
        } else {
          // Usuario ya tiene contraseña - mostrar campo de contraseña normal
          setIsFirstLogin(false);
          setShowPasswordSetup(false);
          setHasCheckedFirstLogin(true);
          console.log('🔐 [FRONTEND] Usuario existente - solicitando contraseña actual');
        }
      } else {
        console.log('❌ [FRONTEND] Error en verificación:', {
          responseOk: response.ok,
          status: response.status,
          errorMessage: result.error,
          fullResult: result
        });
        setError(result.error || 'Usuario no encontrado');
      }
    } catch (err) {
      console.error('💥 [FRONTEND] Error de conexión en check-first-login:', err);
      console.error('💥 [FRONTEND] Detalles del error:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para configurar contraseña por primera vez
  const handlePasswordSetup = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitar el envío tradicional del formulario
    
    console.log('🔒 [SECURITY] Configuración de contraseña via JavaScript, no GET tradicional');
    
    // Validaciones
    if (!formData.newPassword || !formData.confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/setup-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documento: formData.usuario.trim(),
          newPassword: formData.newPassword
        })
      });

      const result = await response.json();

      if (response.ok && result.user) {
        // Configuración exitosa, hacer login automático
        login(result.user);
        router.push('/dashboard');
      } else {
        setError(result.error || 'Error configurando la contraseña');
      }
    } catch (err) {
      console.error('Error configurando contraseña:', err);
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Evitar el envío tradicional del formulario
    
    console.log('🔒 [SECURITY] Formulario enviado via JavaScript, no GET tradicional');
    console.log('📋 [LOGIN] Estado actual:', {
      tipoUsuario: formData.tipoUsuario,
      showPasswordSetup,
      isFirstLogin,
      hasUsuario: !!formData.usuario,
      hasPassword: !!formData.password
    });

    // FLUJO PARA USUARIOS GENÉRICOS (REGULARES)
    if (formData.tipoUsuario === 'regular') {
      // Validar que tenga documento
      if (!formData.usuario.trim()) {
        setError('Por favor ingresa tu número de documento');
        return;
      }

      // Si aún no hemos verificado si es primer login, hacerlo
      if (!hasCheckedFirstLogin) {
        console.log('🔍 [LOGIN] Usuario regular - verificando primer login...');
        await checkFirstLogin();
        return;
      }

      // Si es configuración de contraseña por primera vez
      if (showPasswordSetup && isFirstLogin) {
        console.log('🆕 [LOGIN] Configurando contraseña por primera vez...');
        await handlePasswordSetup(e);
        return;
      }

      // Si el usuario ya tiene contraseña configurada, proceder con login normal
      if (hasCheckedFirstLogin && !isFirstLogin && !showPasswordSetup) {
        if (!formData.password) {
          setError('Por favor ingresa tu contraseña');
          return;
        }
        console.log('🔐 [LOGIN] Login normal para usuario regular con contraseña...');
        // Continuar con el login normal más abajo
      }
    }

    // FLUJO PARA USUARIOS ROOT
    if (formData.tipoUsuario === 'raiz') {
      console.log('👑 [LOGIN] Login de usuario root...');
      if (!formData.usuario || !formData.password) {
        setError('Por favor completa todos los campos');
        return;
      }
    }

    // LOGIN NORMAL (para usuarios root O usuarios regulares con contraseña)
    setIsLoading(true);
    setError('');

    console.log('🔐 [FRONTEND] Iniciando proceso de login...');
    console.log('📝 [FRONTEND] Datos del formulario:', {
      usuario: formData.usuario,
      passwordLength: formData.password.length,
      tipoUsuarioSeleccionado: formData.tipoUsuario,
      hasUsuario: !!formData.usuario,
      hasPassword: !!formData.password
    });

    try {
      // Validaciones básicas
      if (!formData.usuario || !formData.password) {
        setError('Por favor completa todos los campos');
        setIsLoading(false);
        return;
      }

      const requestBody = {
        usuario: formData.usuario,
        password: formData.password,
        tipoUsuarioPreferido: formData.tipoUsuario
      };

      console.log('📤 [FRONTEND] Enviando request...');
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📥 [FRONTEND] Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });

      const result = await response.json();

      console.log('📋 [FRONTEND] Datos de respuesta:', {
        success: result.success,
        hasUser: !!result.user,
        error: result.error,
        development: result.development,
        userId: result.user?.id,
        tipoUsuario: result.user?.tipoUsuario,
        fullResult: result
      });

      if (response.ok && result.user) {
        // Login exitoso - usar el contexto de autenticación
        console.log('✅ [FRONTEND] Login exitoso, datos del usuario:', result.user);
        console.log('🚀 [FRONTEND] Llamando a login() del contexto...');
        
        login(result.user);
        
        console.log('🔄 [FRONTEND] Redirigiendo a dashboard...');
        router.push('/dashboard');
      } else {
        // Mostrar error específico del servidor
        console.log('❌ [FRONTEND] Error en login:', {
          responseStatus: response.status,
          errorMessage: result.error,
          fullResult: result
        });

        // Si hay detalles de configuración, mostrarlos
        if (result.details) {
          console.error('⚙️ [FRONTEND] Detalles de configuración:', result.details);
        }
        if (result.missingVars) {
          console.error('❌ [FRONTEND] Variables faltantes:', result.missingVars);
        }

        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('💥 [FRONTEND] Error de conexión:', err);
      console.error('💥 [FRONTEND] Detalles del error:', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : 'No stack trace'
      });
      setError('Error de conexión. Por favor intenta nuevamente.');
    } finally {
      console.log('🏁 [FRONTEND] Finalizando proceso de login...');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Background similar al home */}
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        >
          <source src="https://res.cloudinary.com/dvnuttrox/video/upload/f_mp4,q_auto:good,w_1920/v1752585561/Corte_pedidos_biochar_f4fhed.mov" type="video/mp4" />
        </video>
        
        <div 
          className="absolute inset-0 bg-black bg-opacity-40"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752096905/DSC_4163_spt7fv.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
      </div>
      
      {/* Contenido del formulario */}
      <div className="relative z-10 w-full max-w-md">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-0 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-br from-gray-50 to-white py-8">
            <CardTitle className="text-3xl font-light text-gray-800 mb-2">
              {showPasswordSetup 
                ? `Hola ${foundUserName || 'Usuario'}` 
                : 'Iniciar Sesión'
              }
            </CardTitle>
            <CardDescription className="text-gray-500 text-lg">
              {showPasswordSetup 
                ? 'Es tu primer inicio de sesión. Crea una contraseña segura.'
                : 'Ingresa tu información para acceder'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} method="POST" className="space-y-8">
              {/* Selector de tipo de usuario - Solo mostrar si no está configurando contraseña */}
              {!showPasswordSetup && (
                <div>
                  <label htmlFor="tipoUsuario" className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Tipo de Usuario
                  </label>
                  <div className="relative">
                    <select
                      id="tipoUsuario"
                      name="tipoUsuario"
                      value={formData.tipoUsuario}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-300 text-lg bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                    >
                      <option value="raiz">Usuario Root (Administrador)</option>
                      <option value="regular">Usuario Genérico</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {formData.tipoUsuario === 'raiz' 
                      ? 'Acceso completo a todas las funciones administrativas' 
                      : 'Acceso con número de documento - primer ingreso requiere configurar contraseña'
                    }
                  </p>
                </div>
              )}

              {/* Campo Usuario/Documento */}
              <div>
                <label htmlFor="usuario" className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {formData.tipoUsuario === 'raiz' ? 'Usuario' : 'Número de Documento'}
                </label>
                <div className="relative">
                  <Input
                    id="usuario"
                    name="usuario"
                    type="text"
                    placeholder={formData.tipoUsuario === 'raiz' ? 'Ej: tu_usuario' : 'Ej: 12345678'}
                    value={formData.usuario}
                    onChange={handleInputChange}
                    disabled={showPasswordSetup}
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-300 text-lg bg-gray-50 focus:bg-white disabled:bg-gray-100"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {formData.tipoUsuario === 'raiz' 
                    ? 'Ingresa tu nombre de usuario de administrador' 
                    : showPasswordSetup 
                      ? `Hola ${foundUserName || 'Usuario'}, configura tu contraseña para completar el registro`
                      : hasCheckedFirstLogin && !isFirstLogin
                        ? `Bienvenido/a ${foundUserName || 'Usuario'} - ingresa tu contraseña actual`
                        : 'Ingresa tu número de documento para verificar tu cuenta'
                  }
                </p>
              </div>

              {/* Campos de contraseña según el estado */}
              {showPasswordSetup ? (
                // Configuración de contraseña por primera vez
                <>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="Crea una contraseña segura"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-300 text-lg bg-gray-50 focus:bg-white"
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirma tu contraseña"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-300 text-lg bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                </>
              ) : (
                // Campo de contraseña normal 
                // Para usuarios root SIEMPRE, o para usuarios regulares que YA tienen contraseña configurada
                (formData.tipoUsuario === 'raiz' || 
                 (formData.tipoUsuario === 'regular' && hasCheckedFirstLogin && !isFirstLogin)) && (
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                      Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Tu contraseña"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-500 focus:ring-opacity-20 focus:border-green-500 transition-all duration-300 text-lg bg-gray-50 focus:bg-white"
                      />
                    </div>
                  </div>
                )
              )}

              {/* Error message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg text-sm shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}

              {/* Botón de submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>
                        {showPasswordSetup ? 'Configurando...' : 
                         formData.tipoUsuario === 'regular' && !hasCheckedFirstLogin ? 'Verificando usuario...' : 
                         'Ingresando...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>
                        {showPasswordSetup ? 'Configurar Contraseña' : 
                         formData.tipoUsuario === 'regular' && !hasCheckedFirstLogin ? 'Verificar Usuario' : 
                         'Ingresar'}
                      </span>
                      <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </form>

            {/* Enlaces adicionales - Solo mostrar si no está configurando contraseña */}
            {!showPasswordSetup && (
              <div className="mt-8 text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">¿Necesitas ayuda?</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <Link href="/registro" className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all duration-200">
                    Regístrate aquí
                  </Link>
                </p>
                <Link 
                  href="/" 
                  className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 font-medium hover:underline transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver al inicio
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
