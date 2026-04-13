'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Brand {
  name: string;
  logo: string;
  url?: string;
}

const brands: Brand[] = [
  { name: 'Apple', logo: '/images/brands/apple.svg', url: 'https://www.apple.com' },
  { name: 'Samsung', logo: '/images/brands/samsung.svg', url: 'https://www.samsung.com' },
  { name: 'Xiaomi', logo: '/images/brands/xiaomi.svg', url: 'https://www.mi.com' },
  { name: 'Google', logo: '/images/brands/google.png', url: 'https://store.google.com' },
  { name: 'Motorola', logo: '/images/brands/motorola.png', url: 'https://www.motorola.com' },
  { name: 'Huawei', logo: '/images/brands/huawei.svg', url: 'https://consumer.huawei.com' },
  { name: 'Sony', logo: '/images/brands/sony.svg', url: 'https://www.sony.com' },
  { name: 'LG', logo: '/images/brands/lg.png', url: 'https://www.lg.com' },
];

interface BrandsCarouselProps {
  title?: string;
  subtitle?: string;
  speed?: number;
}

export function BrandsCarousel({ 
  title = "Marcas que reparamos", 
  subtitle = "Expertos en todas las marcas y modelos",
  speed = 30 
}: BrandsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Configuración del carrusel
  const itemsPerView = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    large: 6,
  };

  const [visibleItems, setVisibleItems] = useState(itemsPerView.desktop);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleItems(itemsPerView.mobile);
      } else if (window.innerWidth < 768) {
        setVisibleItems(itemsPerView.tablet);
      } else if (window.innerWidth < 1024) {
        setVisibleItems(itemsPerView.desktop);
      } else {
        setVisibleItems(itemsPerView.large);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play
  useEffect(() => {
    if (isAutoPlaying && !isHovered) {
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, isHovered, currentIndex]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % (brands.length - visibleItems + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + (brands.length - visibleItems + 1)) % (brands.length - visibleItems + 1));
  };

  const visibleBrands = brands.slice(currentIndex, currentIndex + visibleItems);
  
  // Para asegurar que siempre tengamos suficientes items
  const extendedBrands = [...brands, ...brands.slice(0, visibleItems)];
  const visibleExtendedBrands = extendedBrands.slice(currentIndex, currentIndex + visibleItems);

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-[#0A2B4E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9h14M5 15h14M12 3v18m-9-9h18" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-[#0A2B4E] mb-3">
            {title}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            {subtitle}
          </p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#FFC107] to-[#2E7D32] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Carrusel */}
        <div 
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Contenedor principal */}
          <div 
            ref={containerRef}
            className="overflow-hidden"
          >
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * (100 / visibleItems)}%)` }}
            >
              {extendedBrands.map((brand, idx) => (
                <div
                  key={`${brand.name}-${idx}`}
                  className="flex-shrink-0 px-4"
                  style={{ width: `${100 / visibleItems}%` }}
                >
                  <a
                    href={brand.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group/brand"
                  >
                    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 flex items-center justify-center min-h-[120px] hover:scale-105 transform">
                      {/* Fondo decorativo */}
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white rounded-2xl opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Logo */}
                      <div className="relative z-10">
                        <Image
                          src={brand.logo}
                          alt={`${brand.name} logo`}
                          width={100}
                          height={60}
                          className="object-contain max-h-12 w-auto opacity-70 group-hover/brand:opacity-100 transition-all duration-300 grayscale group-hover/brand:grayscale-0"
                        />
                      </div>
                      
                      {/* Efecto de brillo */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      </div>
                    </div>
                    
                    {/* Nombre de la marca (aparece en hover) */}
                    <p className="text-center text-sm text-gray-400 mt-2 opacity-0 group-hover/brand:opacity-100 transition-opacity duration-300">
                      {brand.name}
                    </p>
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          {visibleItems < brands.length && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#0A2B4E] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#0A2B4E] hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
                aria-label="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Indicadores de paginación */}
        <div className="flex justify-center gap-3 mt-8">
          {Array.from({ length: Math.ceil(brands.length / visibleItems) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * visibleItems)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300"
              aria-label={`Ir a página ${idx + 1}`}
            >
              <span className={`h-2 rounded-full transition-all duration-300 ${
                Math.floor(currentIndex / visibleItems) === idx
                  ? 'w-8 bg-[#0A2B4E]'
                  : 'w-2 bg-gray-300 hover:bg-gray-400'
              }`} />
            </button>
          ))}
        </div>

        {/* Control de auto-play (opcional) */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
            className="text-xs text-gray-400 hover:text-[#0A2B4E] transition-colors flex items-center gap-1"
          >
            {isAutoPlaying ? (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pausar auto-play
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reanudar auto-play
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
