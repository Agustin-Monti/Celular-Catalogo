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

  return (
    <Link href={`/producto/${product.id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group h-full flex flex-col">
        {/* Imagen - altura fija */}
        <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Smartphone className="h-16 w-16 text-gray-400" />
              <span className="text-xs text-gray-400 mt-2">Sin imagen</span>
            </div>
          )}
          
          {/* Badge de tipo */}
          <div className="absolute top-3 left-3">
            <span className={`${typeConfig.bg} ${typeConfig.text} text-xs font-bold px-3 py-1 rounded-full shadow-md`}>
              {typeConfig.label}
            </span>
          </div>
          
          {/* Badge de destacado */}
          {product.is_featured && (
            <div className="absolute top-3 right-3">
              <div className="bg-[#FFC107] text-[#0A2B4E] px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-bold">DESTACADO</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Contenido - flex-grow para ocupar espacio disponible */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Título y marca - altura fija para el título */}
          <div className="mb-3 min-h-[60px]">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{product.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{product.brand} {product.model}</p>
          </div>
          
          {/* Especificaciones rápidas - altura fija */}
          {product.specs && (
            <div className="flex flex-wrap gap-2 mb-4 min-h-[48px]">
              {product.specs.storage && (
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <HardDrive size={12} />
                  <span>{product.specs.storage}</span>
                </div>
              )}
              {product.specs.ram && (
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <Cpu size={12} />
                  <span>{product.specs.ram}</span>
                </div>
              )}
              {product.specs.battery && (
                <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded">
                  <Battery size={12} />
                  <span>{product.specs.battery}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Precio y botón - se empujan hacia abajo con mt-auto */}
          <div className="mt-auto">
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-[#0A2B4E]">
                  ${product.price.toLocaleString('es-MX')}
                </span>
                {product.original_price && (
                  <span className="text-sm text-gray-400 line-through">
                    ${product.original_price.toLocaleString('es-MX')}
                  </span>
                )}
              </div>
            </div>
            
            {/* Botón Ver detalles */}
            <button className="w-full bg-[#0A2B4E] text-white py-2.5 rounded-lg hover:bg-[#1E4A76] transition-colors flex items-center justify-center gap-2 font-semibold group-hover:bg-[#1E4A76]">
              <Eye size={18} />
              Ver detalles
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}