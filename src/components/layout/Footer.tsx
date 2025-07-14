export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-sirius-dark to-medical-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg p-2">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">SIRIUS</h3>
                <p className="text-sm text-gray-300 uppercase tracking-wider">Regenerative Laboratory</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed mb-4">
              Laboratorio especializado en medicina regenerativa y análisis clínicos avanzados. 
              Comprometidos con la excelencia científica y la innovación en salud.
            </p>
            <div className="flex space-x-4">
              <span className="px-3 py-1 bg-primary-600 text-white text-xs rounded-full">ISO 15189</span>
              <span className="px-3 py-1 bg-secondary-600 text-white text-xs rounded-full">Medicina Regenerativa</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-primary-300">
              Contacto
            </h3>
            <div className="space-y-3 text-gray-300">
              <p className="flex items-center">
                <span className="mr-2">📞</span> +34 900 123 456
              </p>
              <p className="flex items-center">
                <span className="mr-2">📧</span> info@siriuslab.es
              </p>
              <p className="flex items-center">
                <span className="mr-2">📍</span> Madrid, España
              </p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary-300">
              Horarios
            </h3>
            <div className="space-y-2 text-gray-300">
              <p>Lun - Vie: 8:00 - 20:00</p>
              <p>Sábado: 9:00 - 14:00</p>
              <p>Domingo: Cerrado</p>
              <p className="text-sm text-primary-300 mt-3">Urgencias 24/7</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 SIRIUS Regenerative Laboratory. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="/privacy" className="hover:text-primary-300 transition-colors">Privacidad</a>
              <a href="/terms" className="hover:text-primary-300 transition-colors">Términos</a>
              <a href="/cookies" className="hover:text-primary-300 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
