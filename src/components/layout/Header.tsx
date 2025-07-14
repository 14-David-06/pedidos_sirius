import Link from 'next/link';

export default function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-3">
            <img 
              src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
              alt="Sirius Logo" 
              className="h-12 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link 
              href="/catalogo" 
              className="text-white hover:text-gray-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-1 rounded"
            >
              Catálogo
            </Link>
            <Link 
              href="/login" 
              className="text-white hover:text-gray-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-1 rounded"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register" 
              className="bg-white bg-opacity-20 backdrop-blur-sm text-white border border-white border-opacity-30 px-6 py-2 rounded-lg hover:bg-opacity-30 transition-all duration-200 font-medium text-lg"
            >
              Crear Cuenta
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
