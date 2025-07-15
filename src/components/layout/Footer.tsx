export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white rounded-lg p-2">
                <img 
                  src="https://res.cloudinary.com/dvnuttrox/image/upload/v1752508146/logo_t6fg4d.png" 
                  alt="Sirius Logo" 
                  className="h-8 w-auto"
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">Sirius Regenerative Solutions</h3>
                <p className="text-sm text-green-300">S.A.S ZOMAC - Biochar Blend</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm">Soluciones ecológicas y regenerativas para la restauración de suelos y captura de carbono.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 text-green-300">
              Información del Producto
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>🌱 Biochar Blend premium</p>
              <p>📦 Presentaciones: BigBag y Lona</p>
              <p>♻️ 100% sostenible y regenerativo</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4 text-green-300">
              Contacto Comercial
            </h3>
            <div className="space-y-2 text-gray-300 text-sm">
              <p>📧 adm@siriusregenerative.com</p>
              <p>Barranca de Upía - Meta - Colombia</p>
              <p>🕒 Lun - Vie: 7:00 AM - 5:00 PM</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Sirius Regenerative Solutions S.A.S ZOMAC. Plataforma especializada en pedidos de Biochar Blend.</p>
          <p className="mt-2 text-green-400">Comprometidos con la regeneración del suelo y la captura de carbono</p>
        </div>
      </div>
    </footer>
  );
}
