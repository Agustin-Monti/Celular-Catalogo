'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { 
  Package, 
  ShoppingCart, 
  Star, 
  Shield,
  Battery,
  Smartphone
} from 'lucide-react';

interface AccessoryCardProps {
  accessory: Product;
}

export function AccessoryCard({ accessory }: AccessoryCardProps) {
  const getCategoryIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('funda')) return Shield;
    if (nameLower.includes('vidrio') || nameLower.includes('templado')) return Shield;
    if (nameLower.includes('cargador')) return Battery;
    if (nameLower.includes('cable')) return Battery;
    return Package;
  };

  const getCategoryColor = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('funda')) return 'from-purple-500 to-purple-600';
    if (nameLower.includes('vidrio') || nameLower.includes('templado')) return 'from-blue-500 to-blue-600';
    if (nameLower.includes('cargador')) return 'from-orange-500 to-orange-600';
    if (nameLower.includes('cable')) return 'from-green-500 to-green-600';
    return 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('funda')) return 'Funda';
    if (nameLower.includes('vidrio') || nameLower.includes('templado')) return 'Vidrio';
    if (nameLower.includes('cargador')) return 'Cargador';
    if (nameLower.includes('cable')) return 'Cable';
    if (nameLower.includes('audífonos') || nameLower.includes('audifonos')) return 'Audífonos';
    return 'Accesorio';
  };

  const CategoryIcon = getCategoryIcon(accessory.name);
  const gradientColor = getCategoryColor(accessory.name);
  const categoryLabel = getCategoryLabel(accessory.name);

  return (
    <Link href={`/producto/${accessory.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 h-full flex flex-col">
        {/* Imagen */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden flex-shrink-0">
          {accessory.images?.[0] ? (
            <Image
              src={accessory.images[0]}
              alt={accessory.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="w-16 h-16 text-gray-300" />
            </div>
          )}
          
          {/* Badge de categoría */}
          <div className={`absolute top-3 left-3 bg-gradient-to-r ${gradientColor} text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md`}>
            <CategoryIcon className="w-3 h-3" />
            <span>{categoryLabel}</span>
          </div>
          
          {/* Badge de destacado */}
          {accessory.is_featured && (
            <div className="absolute top-3 right-3 bg-[#FFC107] text-[#0A2B4E] text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Star className="w-3 h-3 fill-current" />
              Destacado
            </div>
          )}
        </div>
        
        {/* Contenido */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-[#0A2B4E] transition-colors">
            {accessory.name}
          </h3>
          <p className="text-xs text-gray-500 mb-2">
            {accessory.brand}
          </p>
          
          {/* Especificación rápida */}
          {accessory.specs?.compatible && (
            <p className="text-xs text-gray-400 mb-2 flex items-center gap-1">
              <Smartphone className="w-3 h-3" />
              {accessory.specs.compatible}
            </p>
          )}
          
          {/* Precio y carrito */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-[#0A2B4E]">
                ${accessory.price.toLocaleString('es-MX')}
              </span>
              {accessory.original_price && (
                <span className="text-xs text-gray-400 line-through ml-1">
                  ${accessory.original_price.toLocaleString('es-MX')}
                </span>
              )}
            </div>
            <div className="bg-[#0A2B4E]/10 rounded-full p-2 group-hover:bg-[#0A2B4E] transition-colors">
              <ShoppingCart className="w-4 h-4 text-[#0A2B4E] group-hover:text-white transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}