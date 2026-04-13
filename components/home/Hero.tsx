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
      {/* Fondo decorativo - OPTIMIZADO: reducido tamaño y sin transformaciones que causan CLS */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#2E7D32] rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFC107] rounded-full filter blur-3xl"></div>
        {/* Elemento problemático eliminado o simplificado */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-r from-[#2E7D32] to-[#FFC107] rounded-full filter blur-3xl opacity-10"></div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20 relative">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Columna izquierda - Texto */}
          <div className="text-center lg:text-left">
            {/* Logo y nombre - Con dimensiones fijas para evitar CLS */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm">
                <Image
                  src="/images/logoo2.png"
                  alt="CC Reparaciones Móviles"
                  fill
                  className="object-contain p-1"
                  sizes="(max-width: 768px) 56px, 80px"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-3xl font-bold leading-tight">
                  CC Reparaciones
                </span>
                <span className="text-base md:text-xl text-[#FFC107] font-semibold">
                  Móviles
                </span>
              </div>
            </div>

            {/* Título principal - Con altura reservada */}
            <div className="mb-4">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="text-[#FFC107]">Reparación</span>
                <br />
                y <span className="text-[#FFC107]">Venta</span>
                <br />
                de Celulares
              </h1>
            </div>

            {/* Descripción - Con altura reservada */}
            <div className="mb-6">
              <p className="text-base md:text-lg text-gray-200 max-w-xl mx-auto lg:mx-0">
                Brindamos el mejor servicio técnico y los mejores precios en equipos nuevos y usados.
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
              <button
                onClick={handleCatalogo}
                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
              >
                Ver Catálogo
              </button>
              <button
                onClick={handleAccesorios}
                className="bg-transparent border-2 border-white hover:bg-white hover:text-[#0A2B4E] text-white px-6 py-2.5 md:px-8 md:py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 cursor-pointer"
              >
                Ver Accesorios
              </button>
            </div>

            {/* Beneficios - Grid con tamaño fijo */}
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto lg:mx-0">
              {benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <benefit.icon className="h-4 w-4 text-[#FFC107]" />
                  <span className="text-gray-200">{benefit.text}</span>
                </div>
              ))}
            </div>

            {/* Estadísticas - Solo mostrar en cliente con altura reservada */}
            <div className="mt-6 pt-4 border-t border-white/20 max-w-md mx-auto lg:mx-0 min-h-[100px]">
              {isClient && (
                <div className="grid grid-cols-3 gap-4">
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
          </div>

          {/* Columna derecha - Imagen optimizada */}
          <div className="relative flex justify-center items-center mt-8 lg:mt-0">
            <div className="relative w-72 h-72 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px] mx-auto">
              <Image
                src="/images/reparacion.webp"
                alt="Reparación de celulares"
                fill
                className="object-contain drop-shadow-2xl"
                priority
                sizes="(max-width: 768px) 288px, (max-width: 1200px) 384px, 450px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
