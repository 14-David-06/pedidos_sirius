'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Settings } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
              alt="Sirius Logo" 
              className="h-16 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  href="/dashboard"
                  className="bg-blue-600 bg-opacity-80 backdrop-blur-sm text-white border border-blue-400 border-opacity-40 px-6 py-3 rounded-lg hover:bg-blue-500 hover:bg-opacity-90 transition-all duration-200 font-medium shadow-lg transform hover:scale-105 min-w-[120px] text-center"
                >
                  Dashboard
                </Link>
                
                {/* Mostrar Configuración solo para usuarios raíz y admin */}
                {(user.tipoUsuario === 'raiz' || user.rol === 'Admin') && (
                  <Link 
                    href="/configuracion"
                    className="bg-purple-600 bg-opacity-80 backdrop-blur-sm text-white border border-purple-400 border-opacity-40 px-6 py-3 rounded-lg hover:bg-purple-500 hover:bg-opacity-90 transition-all duration-200 font-medium shadow-lg transform hover:scale-105 min-w-[120px] text-center flex items-center justify-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Configuración</span>
                  </Link>
                )}
                
                <div className="flex items-center space-x-2 bg-gray-800 bg-opacity-80 backdrop-blur-sm text-white px-6 py-3 rounded-lg border border-gray-600 border-opacity-40 shadow-lg min-w-[120px] justify-center">
                  <User size={16} />
                  <span className="text-sm font-medium">{user.nombre}</span>
                  {user.tipoUsuario === 'raiz' && (
                    <span className="text-xs bg-yellow-500 bg-opacity-80 text-yellow-900 px-2 py-1 rounded-full font-bold ml-2">
                      RAÍZ
                    </span>
                  )}
                  {user.rol && user.tipoUsuario !== 'raiz' && (
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ml-2 ${
                      user.rol === 'Admin' ? 'bg-red-500 bg-opacity-80 text-red-900' :
                      user.rol === 'Compras' ? 'bg-blue-500 bg-opacity-80 text-blue-900' :
                      user.rol === 'Visualizacion' ? 'bg-green-500 bg-opacity-80 text-green-900' : ''
                    }`}>
                      {user.rol.toUpperCase()}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 bg-opacity-80 backdrop-blur-sm text-white border border-red-400 border-opacity-40 px-6 py-3 rounded-lg hover:bg-red-500 hover:bg-opacity-90 transition-all duration-200 font-medium text-sm flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105 min-w-[120px]"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            ) : (
              <Link 
                href="/login"
                className="bg-green-600 bg-opacity-80 backdrop-blur-sm text-white border border-green-400 border-opacity-40 px-6 py-3 rounded-lg hover:bg-green-500 hover:bg-opacity-90 transition-all duration-200 font-medium shadow-lg transform hover:scale-105 min-w-[120px] text-center"
              >
                Acceder
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
