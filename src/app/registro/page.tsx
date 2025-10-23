'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

export default function RegistroPage() {
  const router = useRouter();
  
  // Datos de departamentos y municipios de Colombia
  const departamentosMunicipios = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
    "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Apartadó", "Turbo", "Rionegro", "Sabaneta", "Caldas", "La Estrella", "Copacabana", "Girardota", "Barbosa", "Puerto Berrío", "Necoclí", "Caucasia", "Santo Domingo", "El Retiro", "Guarne", "San Pedro de los Milagros", "Marinilla", "El Carmen de Viboral", "Granada", "Concepción", "La Ceja", "Abejorral", "Sonsón", "Argelia", "Nariño", "Cocorná", "San Rafael", "San Carlos", "Alejandría", "San Roque", "Maceo", "Puerto Triunfo", "Doradal", "San Luis", "Puerto Nare", "Caracolí", "Yondó"],
    "Arauca": ["Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón", "Saravena", "Tame"],
    "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Galapa", "Puerto Colombia", "Sabanagrande", "Polonuevo", "Ponedera", "Sabanalarga", "Santo Tomás", "Baranoa", "Usiacurí", "Juan de Acosta", "Piojó", "Tubará", "Campo de la Cruz", "Candelaria", "Manatí", "Repelón", "Santa Lucía", "Suan", "Luruaco", "Palmar de Varela"],
    "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar", "Arjona", "Mahates", "San Pablo", "Santa Rosa", "Simití", "Mompós", "San Jacinto", "María la Baja", "Clemencia", "Santa Catalina", "Villanueva", "San Juan Nepomuceno", "Córdoba", "San Cristóbal", "Calamar", "Soplaviento", "Montecristo", "Pinillos", "Hatillo de Loba", "Talaigua Nuevo", "Altos del Rosario", "Barranco de Loba", "Cicuco", "Margarita", "Mompós", "San Fernando", "Tiquisio", "Zambrano", "Achí", "San Jacinto del Cauca", "San Martín de Loba"],
    "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Villa de Leyva", "Barbosa", "Moniquirá", "Puerto Boyacá", "Garagoa", "Nobsa", "Tibasosa", "Firavitoba", "Iza", "Cómbita", "Oicatá", "Siachoque", "Toca", "Motavita", "Chivatá", "Cucaita", "Samacá", "Ventaquemada", "Nuevo Colón", "Boyacá", "Jenesano", "Ráquira", "Sutamarchán", "Tinjacá", "Villa de Leyva", "Arcabuco", "Gachantivá", "Santa Sofía", "Sáchica", "Sutamarchán", "Tinjacá"],
    "Caldas": ["Manizales", "Villamaría", "Chinchiná", "Palestina", "La Dorada", "Riosucio", "Anserma", "Belalcázar", "Viterbo", "Aguadas", "Pácora", "Salamina", "Aranzazu", "Neira", "Filadelfia", "Supía", "Marmato", "Risaralda", "San José", "Marulanda", "Manzanares", "Marquetalia", "Pensilvania", "Samaná", "Victoria"],
    "Caquetá": ["Florencia", "Puerto Rico", "San Vicente del Caguán", "La Montañita", "Curillo", "El Paujil", "Cartagena del Chairá", "Belén de los Andaquíes", "Albania", "El Doncello", "Morelia", "San José del Fragua", "Milán", "Solano", "Solita", "Valparaíso"],
    "Casanare": ["Yopal", "Aguazul", "Tauramena", "Villanueva", "Monterrey", "Sabanalarga", "Recetor", "Chameza", "Hato Corozal", "Maní", "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "San Luis de Palenque", "Támara", "Trinidad", "Chámeza"],
    "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Guapi", "Corinto", "Piendamó", "Silvia", "Caldono", "Jambaló", "Toribío", "Miranda", "Padilla", "Villa Rica", "Balboa", "Argelia", "El Tambo", "Timbío", "Rosas", "La Sierra", "Bolívar", "Mercaderes", "Florencia", "Patía", "Sucre", "Almaguer", "San Sebastián", "Santa Rosa", "Sotará", "Puracé", "Inzá", "Belalcázar", "Páez"],
    "Cesar": ["Valledupar", "Aguachica", "Codazzi", "Bosconia", "El Copey", "Curumaní", "Chimichagua", "Chiriguaná", "Astrea", "Becerril", "La Gloria", "Pelaya", "Pailitas", "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque", "Gamarra", "González", "La Jagua de Ibirico", "La Paz", "Manaure", "Pueblo Bello"],
    "Chocó": ["Quibdó", "Istmina", "Condoto", "Tadó", "Riosucio", "Acandí", "Bahía Solano", "Juradó", "Nuquí", "Bojayá", "El Carmen de Atrato", "Lloró", "Bagadó", "Carmen del Darién", "Cértegui", "Unión Panamericana", "Río Iró", "Río Quito", "San José del Palmar", "Sipí", "Atrato", "Vigía del Fuerte", "Belén de Bajirá", "Cantón de San Pablo", "El Litoral del San Juan", "Medio Atrato", "Medio Baudó", "Medio San Juan", "Nóvita", "Río Iro"],
    "Córdoba": ["Montería", "Cereté", "Sahagún", "Lorica", "Ciénaga de Oro", "Montelíbano", "Planeta Rica", "Ayapel", "Buenavista", "Chinú", "Cotorra", "La Apartada", "Los Córdobas", "Momil", "Moñitos", "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima", "San Andrés Sotavento", "San Antero", "San Bernardo del Viento", "San Carlos", "San José de Uré", "San Pelayo", "Tierralta", "Tuchín", "Valencia"],
    "Cundinamarca": ["Bogotá", "Soacha", "Fusagasugá", "Facatativá", "Zipaquirá", "Chía", "Mosquera", "Madrid", "Funza", "Cajicá", "Sibaté", "Tocancipá", "Gachancipá", "Sopó", "La Calera", "Cota", "Tenjo", "Tabio", "Subachoque", "El Rosal", "Bojacá", "Facatativá", "Zipacón", "Anolaima", "Cachipay", "La Mesa", "Tena", "Viotá", "Girardot", "Ricaurte", "Agua de Dios", "Nariño", "Tocaima", "Guaduas", "Puerto Salgar", "Caparrapí", "Yacopí", "La Palma", "Pacho", "San Cayetano", "Villagómez", "Guachetá", "Lenguazaque", "Simijaca", "Susa", "Carmen de Carupa", "Tausa", "Cogua", "Nemocón", "Gachancipá", "Suesca", "Sesquilé", "Guatavita", "Guasca", "Junín", "Machetá", "Manta", "Tibirita", "Villapinzón", "Chocontá", "Suesca"],
    "Guainía": ["Inírida", "Barranco Minas", "Cacahual", "La Guadalupe", "Mapiripana", "Morichal", "Pana Pana", "Puerto Colombia", "San Felipe"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno", "Miraflores"],
    "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Aipe", "Algeciras", "Baraya", "Yaguará", "Hobo", "Iquira", "Teruel", "Tello", "Villavieja", "Rivera", "Palermo", "Timaná", "Saladoblanco", "San Agustín", "Isnos", "Guadalupe", "Suaza", "Tarqui", "Gigante", "Paicol", "Tesalia", "Nátaga", "La Argentina", "Acevedo", "Elías", "Oporapa", "Palestina", "Pital", "Santa María"],
    "La Guajira": ["Riohacha", "Maicao", "Uribia", "Manaure", "San Juan del Cesar", "Villanueva", "El Molino", "Urumita", "Barrancas", "Fonseca", "Distracción", "Hatonuevo", "La Jagua del Pilar", "Albania", "Dibulla"],
    "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "Aracataca", "El Banco", "Plato", "Zona Bananera", "Algarrobo", "Ariguaní", "Cerro San Antonio", "Chivolo", "Concordia", "El Piñón", "El Retén", "Guamal", "Nueva Granada", "Pedraza", "Pijiño del Carmen", "Pivijay", "Pueblo Viejo", "Remolino", "Sabanas de San Ángel", "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana", "Santa Bárbara de Pinto", "Sitionuevo", "Tenerife", "Zapayán"],
    "Meta": ["Villavicencio", "Acacías", "Granada", "San Martín", "Puerto López", "Cumaral", "Restrepo", "El Calvario", "San Carlos de Guaroa", "Castilla la Nueva", "Cabuyaro", "Puerto Gaitán", "La Macarena", "Uribe", "Mesetas", "Vistahermosa", "Puerto Rico", "Puerto Concordia", "Puerto Lleras", "Fuente de Oro", "San Juan de Arama", "Lejanías", "El Castillo", "El Dorado", "Guamal", "Barranca de Upía", "Paratebueno"],
    "Nariño": ["Pasto", "Tumaco", "Ipiales", "Túquerres", "Samaniego", "Sandona", "La Unión", "Yacuanquer", "Tangua", "Funes", "Guachucal", "Cumbal", "Carlosama", "Aldana", "Pupiales", "Gualmatán", "Contadero", "Córdoba", "Potosí", "Iles", "Cuaspud", "Barbacoas", "Magüí", "Roberto Payán", "Mosquera", "Olaya Herrera", "El Charco", "La Tola", "Satinga", "Santa Bárbara", "Francisco Pizarro", "Policarpa", "Cumbitara", "Los Andes", "Leiva", "El Rosario", "El Peñol", "El Tablón de Gómez", "La Cruz", "San Bernardo", "Belén", "Colón", "San Lorenzo", "Arboleda", "Buesaco", "Chachagüí", "Consacá", "El Tambo", "Florida", "Imués", "La Florida", "Linares", "Mallama", "Nariño", "Ospina", "Providencia", "Puerres", "Ricaurte", "Santacruz", "Sapuyes"],
    "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios", "El Zulia", "San Cayetano", "Puerto Santander", "Villa Caro", "Teorama", "Tibú", "Sardinata", "El Tarra", "Convención", "González", "San Calixto", "Hacarí", "La Playa", "Ábrego", "La Esperanza", "Arboledas", "Cucutilla", "Mutiscua", "Pamplonita", "Silos", "Chinácota", "Ragonvalia", "Herrán", "Durania", "Bochalema", "Cácota", "Cerrito", "Chitará", "Labateca", "Toledo", "Bucarasica", "El Carmen", "San Pedro", "Villa Caro"],
    "Putumayo": ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez", "Puerto Caicedo", "Puerto Guzmán", "Leguízamo", "Villagarzón", "Puerto Leguízamo", "San Francisco", "San Miguel", "Santiago", "Sibundoy", "Colón"],
    "Quindío": ["Armenia", "Calarcá", "La Tebaida", "Montenegro", "Quimbaya", "Circasia", "Filandia", "Salento", "Pijao", "Córdoba", "Buenavista", "Génova"],
    "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Cartago", "Chinchiná", "Marsella", "Belén de Umbría", "Apía", "Balboa", "La Celia", "Guática", "Mistrató", "Pueblo Rico", "Quinchía", "Santuario"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
    "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil", "Barbosa", "Socorro", "Málaga", "Vélez", "Zapatoca", "Puente Nacional", "Simacota", "El Socorro", "Mogotes", "San Joaquín", "Curití", "Pinchote", "Villanueva", "Guadalupe", "Guapotá", "Oiba", "Palmar", "Palmas del Socorro", "Páramo", "San Benito", "Sucre", "Suratá", "Valle de San José", "Vetas", "California", "Charta", "El Playón", "Encino", "Florián", "Galán", "Gámbita", "Guaca", "Güepsa", "Hato", "Jesús María", "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebríja", "Los Santos", "Macaravita", "Matanza", "Ocamonte", "Onzaga", "Palmas del Socorro", "Páramo", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro", "Sabana de Torres", "San Andrés", "San Benito", "San José de Miranda", "San Miguel", "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Suaita", "Tona", "Valle de San José", "Capitanejo", "Carcasí", "Cepitá", "Cerrito", "Concepción", "Enciso", "Guaca", "Macaravita", "Málaga", "Molagavita", "San Andrés", "San José de Miranda", "San Miguel", "Santa Bárbara"],
    "Sucre": ["Sincelejo", "Corozal", "Sampués", "San Marcos", "Tolú", "Coveñas", "San Onofre", "Santiago de Tolú", "Guaranda", "Majagual", "Sucre", "Galeras", "Los Palmitos", "Morroa", "Ovejas", "Palmito", "San Benito Abad", "San Juan de Betulia", "San Luis de Sincé", "San Pedro", "Since", "La Unión", "Buenavista", "Caimito", "Chalán", "Coloso", "El Roble"],
    "Tolima": ["Ibagué", "Espinal", "Melgar", "Girardot", "Honda", "Líbano", "Chaparral", "Purificación", "Mariquita", "Armero", "Guamo", "Saldaña", "Flandes", "Venadillo", "Ambalema", "Coello", "Cunday", "Dolores", "Falan", "Fresno", "Herveo", "Icononzo", "Lérida", "Murillo", "Natagaima", "Ortega", "Palocabildo", "Piedras", "Planadas", "Prado", "Roncesvalles", "Rovira", "San Antonio", "San Luis", "Santa Isabel", "Suárez", "Valle de San Juan", "Villahermosa", "Villarrica", "Ataco", "Alpujarra", "Alvarado", "Anzoátegui", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Coyaima", "Rioblanco"],
    "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Cartago", "Buga", "Jamundí", "Yumbo", "Candelaria", "Florida", "Pradera", "Dagua", "La Cumbre", "Vijes", "Ginebra", "Guacarí", "San Pedro", "Restrepo", "La Unión", "Roldanillo", "Bolívar", "Zarzal", "Sevilla", "Caicedonia", "Andalucía", "Bugalagrande", "Calima", "El Águila", "El Cairo", "El Cerrito", "El Dovio", "La Victoria", "Obando", "Río Frío", "Toro", "Trujillo", "Ulloa", "Versalles", "Alcalá", "Ansermanuevo", "Argelia", "Yotoco"],
    "Vaupés": ["Mitú", "Carurú", "Pacoa", "Papunaua", "Taraira", "Yavaraté"],
  "Vichada": ["Puerto Carreño", "La Primavera", "Santa Rosalía", "Cumaribo"]
};

  const [formData, setFormData] = useState({
    nombreRazonSocial: '',
    tipoDocumento: '',
    documento: '',
    usuario: '',
    ciudad: '',
    departamento: '',
    direccion: '',
    // Información de Contacto - Área Contable
    nombreContable: '',
    telefonoContable: '',
    emailContable: '',
    // Información de Contacto - Área Tesorería
    nombreTesoreria: '',
    telefonoTesoreria: '',
    emailTesoreria: '',
    // Información de Contacto - Área Compras
    nombreCompras: '',
    telefonoCompras: '',
    emailCompras: '',
    contribuyente: '',
    tipoCultivo: '',
    tipoCultivoOtro: '',
    rutFile: null as File | null,
    camaraComercioFile: null as File | null,
    password: '',
    confirmPassword: '',
    // Campos específicos para tabla Usuarios
    nombreCompleto: '',
    tipoDocumentoUsuario: '',
    numeroDocumentoUsuario: '',
    areaEmpresa: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [municipiosDisponibles, setMunicipiosDisponibles] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Si cambia el departamento, actualizar los municipios disponibles
    if (name === 'departamento') {
      setMunicipiosDisponibles(departamentosMunicipios[value as keyof typeof departamentosMunicipios] || []);
      setFormData(prev => ({
        ...prev,
        [name]: value,
        ciudad: '' // Limpiar la ciudad cuando cambie el departamento
      }));
    } else if (name === 'tipoCultivo' && value !== 'Otro') {
      // Si cambia el tipo de cultivo y no es "Otro", limpiar el campo personalizado
      setFormData(prev => ({
        ...prev,
        [name]: value,
        tipoCultivoOtro: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Limpiar error cuando el usuario comience a escribir
    if (error) setError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }));
    }
    // Limpiar error cuando el usuario seleccione un archivo
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validaciones básicas
    if (!formData.nombreRazonSocial || !formData.tipoDocumento || !formData.documento || 
        !formData.nombreCompleto || !formData.tipoDocumentoUsuario || !formData.numeroDocumentoUsuario || 
        !formData.areaEmpresa || !formData.password) {
      setError('Todos los campos marcados con * son obligatorios');
      setIsLoading(false);
      return;
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setIsLoading(false);
      return;
    }

    // Validar documento según el tipo (para la empresa)
    if (formData.tipoDocumento === 'Cédula de Ciudadanía' || formData.tipoDocumento === 'Cédula de Extranjería') {
      if (!/^\d+$/.test(formData.documento)) {
        setError('El número de documento de la empresa debe contener solo números');
        setIsLoading(false);
        return;
      }
    }

    // Validar documento del usuario según el tipo
    if (formData.tipoDocumentoUsuario === 'CC' || formData.tipoDocumentoUsuario === 'CE' || formData.tipoDocumentoUsuario === 'TI') {
      if (!/^\d+$/.test(formData.numeroDocumentoUsuario)) {
        setError('El número de documento del usuario debe contener solo números');
        setIsLoading(false);
        return;
      }
    }

    // Validar emails si están presentes
    const emailFields = [
      { field: formData.emailContable, name: 'Email Contable' },
      { field: formData.emailTesoreria, name: 'Email Tesorería' },
      { field: formData.emailCompras, name: 'Email Compras' }
    ];
    
    for (const { field, name } of emailFields) {
      if (field && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field)) {
        setError(`Formato de email inválido en ${name}`);
        setIsLoading(false);
        return;
      }
    }

    // Validar que al menos un área de contacto esté completa
    const areaContable = formData.nombreContable && formData.telefonoContable && formData.emailContable;
    const areaTesoreria = formData.nombreTesoreria && formData.telefonoTesoreria && formData.emailTesoreria;
    const areaCompras = formData.nombreCompras && formData.telefonoCompras && formData.emailCompras;
    
    if (!areaContable && !areaTesoreria && !areaCompras) {
      setError('Debe completar al menos un área de contacto (Contable, Tesorería o Compras)');
      setIsLoading(false);
      return;
    }

    try {
      // Crear FormData para envío
      const submitFormData = new FormData();
      
      // Agregar todos los campos del formulario
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== '') {
          if (value instanceof File) {
            submitFormData.append(key, value);
          } else {
            submitFormData.append(key, String(value));
      }
      }
      });

      // Enviar a la API de usuarios raíz
      const response = await fetch('/api/registro-usuario-raiz', {
        method: 'POST',
        body: submitFormData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al registrar usuario');
      }

      // Registro exitoso, redirigir al login
      router.push('/login?message=Registro exitoso. Ahora puedes iniciar sesión.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar usuario. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative py-12 px-6">
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
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: 'url(https://res.cloudinary.com/dvnuttrox/image/upload/v1752167074/20032025-DSC_3427_1_1_zmq71m.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: -1
          }}
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 max-w-4xl mx-auto pt-20">
        {/* Título */}
          <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-3 leading-tight">
            Registro de Cliente
            </h1>
          <p className="text-green-300 text-xl font-medium tracking-wide">
            Sirius Regenerative Solutions
            </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto mt-4 rounded-full"></div>
          </div>

        {/* Formulario de registro */}
        <Card className="bg-white bg-opacity-98 backdrop-blur-md shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-br from-gray-50 to-white py-6">
            <CardTitle className="text-2xl font-light text-gray-800 mb-2">Crear Nueva Cuenta</CardTitle>
            <CardDescription className="text-gray-500">
              Completa los siguientes datos para registrarte
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información Tributaria */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Tributaria</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label htmlFor="nombreRazonSocial" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre o Razón Social <span className="text-red-500">*</span>
                      </label>
                      <Input
                      id="nombreRazonSocial"
                      name="nombreRazonSocial"
                        type="text"
                        placeholder="Nombre completo o razón social"
                      value={formData.nombreRazonSocial}
                        onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="tipoDocumento" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="tipoDocumento"
                        name="tipoDocumento"
                        value={formData.tipoDocumento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                      <option value="">Seleccionar tipo de documento...</option>
                      <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                      <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                      <option value="NIT">NIT</option>
                      <option value="Pasaporte">Pasaporte</option>
                      <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                      </select>
                    </div>
                  {formData.tipoDocumento && (
                    <div>
                      <label htmlFor="documento" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de {formData.tipoDocumento} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="documento"
                        name="documento"
                        type="text"
                        placeholder={`Ingrese su ${formData.tipoDocumento.toLowerCase()}`}
                        value={formData.documento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  )}
                    <div>
                    <label htmlFor="rutFile" className="block text-sm font-medium text-gray-700 mb-2">
                      RUT <span className="text-red-500">*</span>
                      </label>
                    <div className="relative">
                      <input
                        id="rutFile"
                        name="rutFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      {formData.rutFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Archivo seleccionado: {formData.rutFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                    <div>
                    <label htmlFor="contribuyente" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Contribuyente
                      </label>
                    <select
                      id="contribuyente"
                      name="contribuyente"
                      value={formData.contribuyente}
                        onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Gran Contribuyente">Gran Contribuyente</option>
                      <option value="Régimen Ordinario">Régimen Ordinario</option>
                      <option value="Régimen Simple de Tributación">Régimen Simple de Tributación</option>
                      <option value="No Responsable">No Responsable</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="camaraComercioFile" className="block text-sm font-medium text-gray-700 mb-2">
                      Cámara de Comercio <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="camaraComercioFile"
                        name="camaraComercioFile"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                      />
                      {formData.camaraComercioFile && (
                        <p className="mt-2 text-sm text-green-600">
                          Archivo seleccionado: {formData.camaraComercioFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de Ubicación */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Ubicación</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="departamento"
                        name="departamento"
                        value={formData.departamento}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                      <option value="">Seleccionar departamento...</option>
                      {Object.keys(departamentosMunicipios).map(departamento => (
                        <option key={departamento} value={departamento}>
                          {departamento}
                        </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad/Municipio <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="ciudad"
                        name="ciudad"
                        value={formData.ciudad}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        disabled={!formData.departamento}
                      required
                      >
                      <option value="">
                        {formData.departamento ? "Seleccionar ciudad/municipio..." : "Primero selecciona un departamento"}
                      </option>
                      {municipiosDisponibles.map(municipio => (
                        <option key={municipio} value={municipio}>
                          {municipio}
                        </option>
                        ))}
                      </select>
                    </div>
                  <div className="md:col-span-2">
                      <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                      </label>
                      <Input
                        id="direccion"
                        name="direccion"
                        type="text"
                        placeholder="Dirección completa"
                        value={formData.direccion}
                        onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Información de Contacto */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
                
                {/* Área Contable */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3 border-l-4 border-green-500 pl-3">Área Contable</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="nombreContable" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="nombreContable"
                        name="nombreContable"
                        type="text"
                        placeholder="Nombre del contacto"
                        value={formData.nombreContable}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="telefonoContable" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="telefonoContable"
                        name="telefonoContable"
                        type="tel"
                        placeholder="Ej: 3001234567"
                        value={formData.telefonoContable}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="emailContable" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="emailContable"
                        name="emailContable"
                        type="email"
                        placeholder="contable@empresa.com"
                        value={formData.emailContable}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                    </div>

                {/* Área Tesorería */}
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3 border-l-4 border-blue-500 pl-3">Área Tesorería</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                      <div>
                      <label htmlFor="nombreTesoreria" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                        </label>
                        <Input
                        id="nombreTesoreria"
                        name="nombreTesoreria"
                          type="text"
                        placeholder="Nombre del contacto"
                        value={formData.nombreTesoreria}
                          onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          required
                        />
                      </div>
                    <div>
                      <label htmlFor="telefonoTesoreria" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="telefonoTesoreria"
                        name="telefonoTesoreria"
                        type="tel"
                        placeholder="Ej: 3001234567"
                        value={formData.telefonoTesoreria}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="emailTesoreria" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="emailTesoreria"
                        name="emailTesoreria"
                        type="email"
                        placeholder="tesoreria@empresa.com"
                        value={formData.emailTesoreria}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Área Compras */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-3 border-l-4 border-orange-500 pl-3">Área Compras</h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="nombreCompras" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="nombreCompras"
                        name="nombreCompras"
                        type="text"
                        placeholder="Nombre del contacto"
                        value={formData.nombreCompras}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="telefonoCompras" className="block text-sm font-medium text-gray-700 mb-2">
                        Teléfono <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="telefonoCompras"
                        name="telefonoCompras"
                        type="tel"
                        placeholder="Ej: 3001234567"
                        value={formData.telefonoCompras}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="emailCompras" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="emailCompras"
                        name="emailCompras"
                        type="email"
                        placeholder="compras@empresa.com"
                        value={formData.emailCompras}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Agrícola */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información Agrícola</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tipoCultivo" className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Cultivo <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="tipoCultivo"
                      name="tipoCultivo"
                      value={formData.tipoCultivo}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    >
                      <option value="">Seleccionar tipo de cultivo...</option>
                      <option value="Café">Café</option>
                      <option value="Maíz">Maíz</option>
                      <option value="Arroz">Arroz</option>
                      <option value="Caña de Azúcar">Caña de Azúcar</option>
                      <option value="Plátano">Plátano</option>
                      <option value="Banano">Banano</option>
                      <option value="Cacao">Cacao</option>
                      <option value="Papa">Papa</option>
                      <option value="Yuca">Yuca</option>
                      <option value="Fríjol">Fríjol</option>
                      <option value="Soya">Soya</option>
                      <option value="Algodón">Algodón</option>
                      <option value="Sorgo">Sorgo</option>
                      <option value="Quinua">Quinua</option>
                      <option value="Aguacate">Aguacate</option>
                      <option value="Mango">Mango</option>
                      <option value="Cítricos">Cítricos</option>
                      <option value="Tomate">Tomate</option>
                      <option value="Cebolla">Cebolla</option>
                      <option value="Zanahoria">Zanahoria</option>
                      <option value="Lechuga">Lechuga</option>
                      <option value="Flores">Flores</option>
                      <option value="Palma de Aceite">Palma de Aceite</option>
                      <option value="Ganadería">Ganadería</option>
                      <option value="Avicultura">Avicultura</option>
                      <option value="Porcicultura">Porcicultura</option>
                      <option value="Piscicultura">Piscicultura</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>
                  
                  {/* Campo adicional cuando se selecciona "Otro" */}
                  {formData.tipoCultivo === 'Otro' && (
                    <div>
                      <label htmlFor="tipoCultivoOtro" className="block text-sm font-medium text-gray-700 mb-2">
                        Especifique el tipo de cultivo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="tipoCultivoOtro"
                        name="tipoCultivoOtro"
                        type="text"
                        placeholder="Escriba su tipo de cultivo"
                        value={formData.tipoCultivoOtro}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Información de Acceso */}
              <div className="pb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Información de Acceso</h3>
                <div className="space-y-6">
                  {/* Primera fila: Nombre y Tipo de Documento */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Nombre Completo */}
                    <div>
                      <label htmlFor="nombreCompleto" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre Completo <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="nombreCompleto"
                        name="nombreCompleto"
                        type="text"
                        placeholder="Nombre completo del usuario"
                        value={formData.nombreCompleto}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    {/* Tipo de Documento del Usuario */}
                    <div>
                      <label htmlFor="tipoDocumentoUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Documento <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="tipoDocumentoUsuario"
                        name="tipoDocumentoUsuario"
                        value={formData.tipoDocumentoUsuario}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Selecciona tipo de documento</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>
                  </div>

                  {/* Segunda fila: Número de Documento y Área */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Número de Documento del Usuario */}
                    <div>
                      <label htmlFor="numeroDocumentoUsuario" className="block text-sm font-medium text-gray-700 mb-2">
                        Número de Documento <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="numeroDocumentoUsuario"
                        name="numeroDocumentoUsuario"
                        type="text"
                        placeholder="Número de documento del usuario"
                        value={formData.numeroDocumentoUsuario}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>

                    {/* Área de la Empresa */}
                    <div>
                      <label htmlFor="areaEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
                        Área de la Empresa <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="areaEmpresa"
                        name="areaEmpresa"
                        type="text"
                        placeholder="Ej: Compras, Contabilidad, Administración"
                        value={formData.areaEmpresa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Tercera fila: Contraseñas */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Contraseña */}
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Contraseña <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        minLength={6}
                        required
                      />
                    </div>

                    {/* Confirmar Contraseña */}
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                        Confirmar Contraseña <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="Repite tu contraseña"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

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

              {/* Términos y condiciones */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 mt-1"
                    required
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-600 leading-relaxed">
                    Acepto los{' '}
                    <a
                      href="https://www.siriusregenerative.co/privacypolicy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all duration-200"
                    >
                      términos y condiciones
                    </a>
                    {' '}y{' '}
                    <a
                      href="https://www.siriusregenerative.co/privacypolicy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all duration-200"
                    >
                      políticas de privacidad
                    </a>
                    {' '}de Sirius Regenerative Solutions
                  </label>
                </div>
              </div>

              {/* Botón de registro */}
                <Button
                  type="submit"
                  disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-500 hover:via-green-600 hover:to-green-700 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                >
                <span className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Registrando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Crear Cuenta</span>
                      <svg className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </form>

            {/* Enlaces adicionales */}
              <div className="mt-8 text-center space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">¿Ya tienes cuenta?</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  <Link href="/login" className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-all duration-200">
                    Inicia sesión aquí
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
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
