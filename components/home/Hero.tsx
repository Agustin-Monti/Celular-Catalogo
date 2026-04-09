'use client';

import { Shield, Award, Clock, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Hero() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const benefits = [
    { icon: Shield, text: 'Garantía garantizada', color: '#FFC107' },
    { icon: Award, text: 'Calidad premium', color: '#FFC107' },
    { icon: Clock, text: 'Servicio express', color: '#FFC107' },
    { icon: CheckCircle, text: 'Piezas originales', color: '#FFC107' },
  ];

  const handleCatalogo = () => {
    router.push('/catalogo');
  };

  const handleAccesorios = () => {
    router.push('/accesorios');
  };

  return (
    <section className="relative bg-gradient-to-br from-[#0A2B4E] via-[#1E4A76] to-[#0A2B4E] text-white overflow-hidden">
      {/* Fondo decorativo con patrones */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#2E7D32] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FFC107] rounded-full filter blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#2E7D32] to-[#FFC107] rounded-full filter blur-3xl opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 py-16 md:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Columna izquierda - Texto */}
          <div className="text-center lg:text-left">
            {/* Logo y nombre */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-8">
              <div className="relative group">
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden shadow-2xl transform group-hover:scale-110 transition-all duration-300 bg-white/10 backdrop-blur-sm">
                  <Image
                    src="/images/logoo2.png"
                    alt="CC Reparaciones Móviles"
                    fill
                    className="object-contain p-1"
                    sizes="(max-width: 768px) 64px, 80px"
                    priority
                  />
                </div>
              </div>
              <div>
                <div className="flex flex-col">
                  <span className="text-2xl md:text-3xl font-bold leading-tight">
                    CC Reparaciones
                  </span>
                  <span className="text-lg md:text-xl text-[#FFC107] font-semibold">
                    Móviles
                  </span>
                </div>
              </div>
            </div>

            {/* Título principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              <span className="text-[#FFC107]">Reparación</span>
              <br />
               y <span className="text-[#FFC107]">Venta</span>
              <br />
              de Celulares
            </h1>

            {/* Descripción */}
            <p className="text-base md:text-lg mb-6 text-gray-200 max-w-xl mx-auto lg:mx-0">
              Brindamos el mejor servicio técnico 
              y los mejores precios en equipos nuevos y usados.
            </p>

            {/* Botones de acción - CONSOLA */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={handleCatalogo}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer z-10 relative"
                style={{ pointerEvents: 'auto' }}
              >
                Ver Catálogo
              </button>
              <button
                onClick={handleAccesorios}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#0A2B4E] text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 cursor-pointer z-10 relative"
                style={{ pointerEvents: 'auto' }}
              >
                Ver Accesorios
              </button>
            </div>

            {/* Beneficios */}
            <div className="grid grid-cols-2 gap-3 max-w-md mx-auto lg:mx-0">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <benefit.icon className="h-4 w-4 text-[#FFC107]" />
                  <span className="text-gray-200">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Estadísticas */}
            {isClient && (
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20 max-w-md mx-auto lg:mx-0">
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[#FFC107]">100+</p>
                  <p className="text-xs text-gray-300">Dispositivos reparados</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[#FFC107]">98%</p>
                  <p className="text-xs text-gray-300">Clientes satisfechos</p>
                </div>
                <div>
                  <p className="text-2xl md:text-3xl font-bold text-[#FFC107]">6</p>
                  <p className="text-xs text-gray-300">Meses de garantía</p>
                </div>
              </div>
            )}
          </div>

          {/* Columna derecha - Imagen de reparación */}
          <div className="relative flex justify-center items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFC107] to-[#2E7D32] rounded-full filter blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-500"></div>
              
              <div className="relative animate-float">
                <div className="relative w-80 h-80 md:w-96 md:h-96 lg:w-[500px] lg:h-[500px] mx-auto">
                  <Image
                    src="/images/reparacion.webp"
                    alt="Reparación de celulares"
                    fill
                    className="object-contain drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ola decorativa */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
          <path fill="rgba(255,255,255,0.05)" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,154.7C960,171,1056,181,1152,165.3C1248,149,1344,107,1392,85.3L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
      </div>
    </section>
  );
}