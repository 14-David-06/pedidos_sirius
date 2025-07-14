import Link from 'next/link';
import { Sprout } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white bg-opacity-95 backdrop-blur-sm border-b border-medical-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-lg p-2">
              <Sprout className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-sirius-dark tracking-tight">
                SIRIUS
              </span>
              <span className="text-xs text-medical-600 font-medium uppercase tracking-wider">
                Regenerative Solutions
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/login" 
              className="text-medical-600 hover:text-secondary-600 transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-secondary-600 to-primary-600 text-white px-6 py-2 rounded-lg hover:from-secondary-700 hover:to-primary-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
