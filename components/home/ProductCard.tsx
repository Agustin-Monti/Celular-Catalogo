'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { Star, Battery, Cpu, HardDrive, Smartphone, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const getTypeConfig = () => {
    switch(product.type) {
      case 'nuevo':
        return { color: '#2E7D32', bg: 'bg-green-100', text: 'text-green-800', label: 'Nuevo' };
      case 'usado':
        return { color: '#FFC107', bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Usado' };
      case 'reparacion':
        return { color: '#0A2B4E', bg: 'bg-blue-100', text: 'text-blue-800', label: 'Reacondicionado' };
      default:
        return { color: '#6B7280', bg: 'bg-gray-100', text: 'text-gray-800', label: 'General' };
    }
  };

  const typeConfig = getTypeConfig();

  // Función para optimizar la URL de la imagen con parámetros de Supabase
  const getOptimizedImageUrl = (url: string, width: number, height: number) => {
    // Si es de Supabase, podemos usar sus parámetros de transformación
    if (url.includes('supabase.co')) {
      // Ejemplo: añadir parámetros de transformación
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}width=${width}&height=${height}&resize=contain`;
    }
    return url;
  };

  // Usar imágenes más pequeñas en móvil
  const imageWidth = 400; // 400px para móvil
  const imageHeight = 400;

  return (
    <Link href={`/producto/${product.id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
        {/* Imagen - con optimización de tamaño */}
        <div className="relative h-48 md:h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
          {product.images && product.images[0] ? (
            <Image
              src={getOptimizedImageUrl(product.images[0], imageWidth, imageHeight)}
              alt={product.name}
              fill
              className="object-contain p-3 md:p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 25vw"
              loading="lazy"
              quality={75}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Smartphone className="h-12 w-12 md:h-16 md:w-16 text-gray-400" />
              <span className="text-xs text-gray-400 mt-2">Sin imagen</span>
            </div>
          )}
          
          {/* Badge de tipo */}
          <div className="absolute top-2 left-2 md:top-3 md:left-3">
            <span className={`${typeConfig.bg} ${typeConfig.text} text-[10px] md:text-xs font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full shadow-md`}>
              {typeConfig.label}
            </span>
          </div>
          
          {/* Badge de destacado */}
          {product.is_featured && (
            <div className="absolute top-2 right-2 md:top-3 md:right-3">
              <div className="bg-[#FFC107] text-[#0A2B4E] px-1.5 py-0.5 md:px-2 md:py-1 rounded-full flex items-center gap-0.5 md:gap-1 shadow-md">
                <Star size={12} className="md:w-3 md:h-3 fill-current" />
                <span className="text-[10px] md:text-xs font-bold">DESTACADO</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Contenido */}
        <div className="p-3 md:p-5 flex flex-col flex-grow">
          {/* Título y marca */}
          <div className="mb-2 md:mb-3 min-h-[50px] md:min-h-[60px]">
            <h3 className="text-sm md:text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-xs md:text-sm text-gray-600 mt-0.5 md:mt-1">{product.brand} {product.model}</p>
          </div>
          
          {/* Especificaciones rápidas */}
          {product.specs && (
            <div className="flex flex-wrap gap-1 md:gap-2 mb-3 md:mb-4 min-h-[32px] md:min-h-[48px]">
              {product.specs.storage && (
                <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-gray-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                  <HardDrive size={10} className="md:w-3 md:h-3" />
                  <span className="text-xs text-gray-600">{product.specs.storage}</span>
                </div>
              )}
              {product.specs.ram && (
                <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-gray-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                  <Cpu size={10} className="md:w-3 md:h-3" />
                  <span className="text-xs text-gray-600">{product.specs.ram}</span>
                </div>
              )}
              {product.specs.battery && (
                <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs bg-gray-100 px-1.5 py-0.5 md:px-2 md:py-1 rounded">
                  <Battery size={10} className="md:w-3 md:h-3" />
                  <span className="text-xs text-gray-600">{product.specs.battery}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Precio y botón */}
          <div className="mt-auto">
            <div className="mb-2 md:mb-4">
              <div className="flex items-baseline gap-1 md:gap-2">
                <span className="text-lg md:text-2xl font-bold text-[#0A2B4E]">
                  ${product.price.toLocaleString('es-AR')}
                </span>
                {product.original_price && (
                  <span className="text-xs md:text-sm text-gray-500 line-through">
                    ${product.original_price.toLocaleString('es-AR')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Botón Ver detalles */}
            <button className="w-full bg-[#0A2B4E] text-white py-1.5 md:py-2.5 rounded-lg hover:bg-[#1E4A76] transition-colors flex items-center justify-center gap-1 md:gap-2 font-semibold text-sm md:text-base group-hover:bg-[#1E4A76]">
              <Eye size={16} className="md:w-[18px] md:h-[18px]" />
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
