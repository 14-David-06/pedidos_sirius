import Link from 'next/link';
import { Microscope } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-medical-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-2">
              <Microscope className="h-8 w-8 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-sirius-dark tracking-tight">
                SIRIUS
              </span>
              <span className="text-xs text-medical-600 font-medium uppercase tracking-wider">
                Regenerative Lab
              </span>
            </div>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/login" 
              className="text-medical-600 hover:text-primary-600 transition-colors font-medium"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white px-6 py-2 rounded-lg hover:from-primary-700 hover:to-secondary-700 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Registrarse
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
