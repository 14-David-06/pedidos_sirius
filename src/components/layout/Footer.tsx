export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white rounded-lg p-2">
                <img 
                  src="https://res.cloudinary.com/dvnuttrox/image/upload/v1747945175/logo_siris-removebg-preview_psxwgc.png" 
                  alt="Sirius Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">Sirius Regenerative Lab</h3>
                <p className="text-sm text-gray-300">Productos Biológicos Especializados</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm">
              Proveedor especializado en cultivos celulares, medios de cultivo y reactivos 
              para investigación en medicina regenerativa y terapias celulares.
            </p>
          </div>
          
          
          <div>
            <h3 className="text-lg font-medium mb-4">
              Productos
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>Cultivos Celulares</p>
              <p>Medios de Cultivo</p>
              <p>Reactivos Especializados</p>
              <p>Factores de Crecimiento</p>
              <p>Enzimas</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">
              Contacto
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>📧 pedidos@siriuslab.co</p>
              <p>📞 +57 (1) 234-5678</p>
              <p>📍 Bogotá, Colombia</p>
              <p>🔬 Laboratorio Certificado</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Sirius Regenerative Lab. Plataforma de pedidos de productos biológicos.</p>
        </div>
      </div>
    </footer>
  );
}
