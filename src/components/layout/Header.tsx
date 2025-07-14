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
              className="h-20 w-auto"
            />
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <a 
              href="https://sirius-landing.vercel.app/contacto" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-green-300 transition-colors font-medium text-lg backdrop-blur-sm px-3 py-1 rounded"
            >
              Contacto
            </a>
            <Link 
              href="/pedido"
              className="bg-green-600 bg-opacity-70 backdrop-blur-sm text-white border border-green-400 border-opacity-30 px-6 py-2 rounded-lg hover:bg-green-500 transition-all duration-200 font-medium text-lg"
            >
              Solicitar Biochar
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
