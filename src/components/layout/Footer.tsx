export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-sirius-dark to-medical-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-secondary-500 to-primary-500 rounded-lg p-2">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">SIRIUS</h3>
                <p className="text-sm text-gray-300 uppercase tracking-wider">Regenerative Solutions S.A.S</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Empresa especializada en regeneración de suelos y soluciones ambientales sostenibles. 
              Comprometidos con la restauración de ecosistemas y la agricultura regenerativa.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-secondary-600 text-white text-xs rounded-full">Regeneración de Suelos</span>
              <span className="px-3 py-1 bg-primary-600 text-white text-xs rounded-full">Análisis Ambientales</span>
              <span className="px-3 py-1 bg-accent-600 text-white text-xs rounded-full">ZOMAC</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary-300">
              Contacto
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center">
                <span className="mr-2">📞</span> +57 (1) 234-5678
              </p>
              <p className="flex items-center">
                <span className="mr-2">📧</span> info@siriussolutions.co
              </p>
              <p className="flex items-center">
                <span className="mr-2">📍</span> Bogotá, Colombia
              </p>
              <p className="flex items-center">
                <span className="mr-2">🌐</span> Zona ZOMAC
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-300">
              Servicios
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>Regeneración de Suelos</p>
              <p>Análisis de Laboratorio</p>
              <p>Consultoría Ambiental</p>
              <p>Agricultura Sostenible</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 SIRIUS Regenerative Solutions S.A.S. Todos los derechos reservados. | ZOMAC
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="/privacy" className="hover:text-secondary-300 transition-colors">Privacidad</a>
              <a href="/terms" className="hover:text-secondary-300 transition-colors">Términos</a>
              <a href="/environmental" className="hover:text-secondary-300 transition-colors">Política Ambiental</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
