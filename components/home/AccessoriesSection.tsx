'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { AccessoryCard } from '@/components/home/AccessoryCard';
import { 
  Package, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface AccessoriesSectionProps {
  title?: string;
  subtitle?: string;
  limit?: number;
}

export function AccessoriesSection({ 
  title = "Accesorios Destacados", 
  subtitle = "Protege y complementa tu equipo con nuestros accesorios de calidad",
  limit = 4 
}: AccessoriesSectionProps) {
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'accesorio')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && data) {
      setAccessories(data);
    }
    setLoading(false);
  };

  // Skeleton loading mejorado con dimensiones fijas
  if (loading) {
    return (
      <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 md:mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gray-200 rounded-2xl animate-pulse"></div>
            <div className="h-7 md:h-8 w-48 bg-gray-200 rounded mx-auto mt-4 animate-pulse"></div>
            <div className="h-4 w-64 md:w-96 bg-gray-200 rounded mx-auto mt-2 animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (accessories.length === 0) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header - Con dimensiones fijas */}
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-2xl mb-4 shadow-lg">
            <Package className="w-7 h-7 md:w-8 md:h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-[#0A2B4E] mb-2 md:mb-3">
            {title}
          </h2>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto px-4">
            {subtitle}
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-[#FFC107] to-[#2E7D32] mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Grid de accesorios */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {accessories.map((accessory) => (
            <AccessoryCard key={accessory.id} accessory={accessory} />
          ))}
        </div>
        
        {/* Botón ver más */}
        <div className="text-center mt-10">
          <Link
            href="/accesorios"
            className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-white border-2 border-[#0A2B4E] text-[#0A2B4E] rounded-xl font-semibold hover:bg-[#0A2B4E] hover:text-white transition-all duration-300 group"
          >
            Ver todos los accesorios
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
