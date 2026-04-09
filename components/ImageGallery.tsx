'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export function ImageGallery({ images, productName }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImage, setModalImage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Manejo de swipe para móvil
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
    
    setTouchStart(0);
    setTouchEnd(0);
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
    if (isMobile) {
      setTimeout(() => {
        scrollThumbnailIntoView((selectedImage + 1) % images.length);
      }, 100);
    }
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
    if (isMobile) {
      setTimeout(() => {
        scrollThumbnailIntoView((selectedImage - 1 + images.length) % images.length);
      }, 100);
    }
  };

  const openModal = (index: number) => {
    setModalImage(index);
    setIsModalOpen(true);
  };

  const scrollThumbnailIntoView = (index: number) => {
    if (thumbnailScrollRef.current && isMobile) {
      const thumbnail = thumbnailScrollRef.current.children[index] as HTMLElement;
      if (thumbnail) {
        thumbnail.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }
  };

  // Modal navigation
  const nextModalImage = () => {
    setModalImage((prev) => (prev + 1) % images.length);
  };

  const prevModalImage = () => {
    setModalImage((prev) => (prev - 1 + images.length) % images.length);
  };

  // Manejo de teclado para modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      if (e.key === 'ArrowLeft') prevModalImage();
      if (e.key === 'ArrowRight') nextModalImage();
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  if (!images || images.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-6xl mb-2">📱</div>
          <p className="text-gray-500">Sin imagen disponible</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-lg p-4 h-full flex flex-col">
        {/* Imagen principal */}
        <div 
          className="relative flex-1 min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <Image
            src={images[selectedImage]}
            alt={`${productName} - imagen principal`}
            fill
            className="object-contain p-4 cursor-pointer transition-transform duration-300 group-hover:scale-105"
            onClick={() => openModal(selectedImage)}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <button
            onClick={() => openModal(selectedImage)}
            className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
          >
            <ZoomIn size={20} />
          </button>
        </div>

        {/* Indicadores de página - SOLO EN MÓVIL */}
        {images.length > 1 && isMobile && (
          <div className="flex justify-center gap-1.5 mt-3">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedImage(idx);
                  scrollThumbnailIntoView(idx);
                }}
                className={`transition-all duration-200 ${
                  selectedImage === idx
                    ? 'w-5 h-1.5 bg-[#0A2B4E] rounded-full'
                    : 'w-1.5 h-1.5 bg-gray-300 rounded-full'
                }`}
                aria-label={`Ir a imagen ${idx + 1}`}
              />
            ))}
          </div>
        )}

        {/* Miniaturas - SOLO EN DESKTOP, en móvil se ocultan porque usamos los dots */}
        {images.length > 1 && !isMobile && (
          <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-thin flex-shrink-0">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 transition-all duration-200 ${
                  selectedImage === idx
                    ? 'ring-2 ring-[#0A2B4E] ring-offset-2'
                    : 'hover:opacity-80'
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} - miniatura ${idx + 1}`}
                  fill
                  className="object-contain p-1"
                />
              </button>
            ))}
          </div>
        )}
        
        {/* Instrucción de swipe - SOLO EN MÓVIL */}
        {images.length > 1 && isMobile && (
          <p className="text-xs text-center text-gray-400 mt-2">
            ← Desliza para cambiar imagen →
          </p>
        )}
      </div>

      {/* Modal de zoom - Mejorado para móvil */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 md:p-4">
          {/* Botón cerrar */}
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black/50 rounded-full p-2 md:p-2"
            aria-label="Cerrar"
          >
            <X size={24} className="md:w-6 md:h-6" />
          </button>
          
          {/* Botones de navegación - SOLO EN DESKTOP */}
          {!isMobile && (
            <>
              <button
                onClick={prevModalImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                aria-label="Anterior"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={nextModalImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
                aria-label="Siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          
          {/* Imagen en modal con swipe para móvil */}
          <div 
            className="relative w-full max-w-5xl h-[80vh]"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => {
              if (!isMobile) return;
              if (!touchStart || !touchEnd) return;
              const distance = touchStart - touchEnd;
              if (distance > 50) nextModalImage();
              if (distance < -50) prevModalImage();
              setTouchStart(0);
              setTouchEnd(0);
            }}
          >
            <Image
              src={images[modalImage]}
              alt={`${productName} - vista ampliada`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
          
          {/* Indicador de página */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded-full">
            {modalImage + 1} / {images.length}
          </div>
          
          {/* Instrucción de swipe - SOLO EN MÓVIL */}
          {isMobile && (
            <p className="absolute bottom-20 left-1/2 -translate-x-1/2 text-black text-xs whitespace-nowrap bg-white px-3 py-1 rounded-full">
              ← Desliza para cambiar imagen →
            </p>
          )}
        </div>
      )}
    </>
  );
}