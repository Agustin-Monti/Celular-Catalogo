import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/home/ProductCard';
import { RepairServiceCard } from '@/components/home/RepairServiceCard';
import { Hero } from '@/components/home/Hero';
import { BrandsCarousel } from '@/components/home/BrandsCarousel';
import { AccessoriesSection } from '@/components/home/AccessoriesSection';
import { CTAButton } from '@/components/home/CTAButton';
import { Smartphone, Wrench, Shield, Truck, Award, Headphones } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  
  // Obtener productos destacados
  const { data: featuredProducts } = await supabase
  .from('products')
  .select('*')
  .eq('is_featured', true)
  .in('type', ['nuevo', 'usado', 'reparacion'])
  .limit(6);
  
  // Obtener servicios de reparación
  const { data: repairServices } = await supabase
    .from('repair_services')
    .select('*')
    .eq('is_available', true)
    .limit(6);
  
  // Beneficios de la empresa
  const benefits = [
    { icon: Shield, title: 'Garantía Garantizada', description: 'Hasta 6 meses en todos nuestros servicios y productos', color: '#2E7D32' },
    { icon: Truck, title: 'Servicio Express', description: 'Reparaciones en menos de 2 horas', color: '#FFC107' },
    { icon: Award, title: 'Calidad Premium', description: 'Piezas originales y certificadas', color: '#0A2B4E' },
    { icon: Headphones, title: 'Soporte Técnico', description: 'Asesoría personalizada post-venta', color: '#2E7D32' },
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />
      
      {/* Beneficios */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="sr-only">Ventajas de CC Reparaciones Móviles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <benefit.icon className="h-10 w-10" style={{ color: benefit.color }} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Productos Destacados */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#0A2B4E] mb-4">Productos Destacados</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Los mejores equipos nuevos, usados y reacondicionados al mejor precio del mercado
              </p>
              <div className="w-24 h-1 bg-[#FFC107] mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-12">
              <a href="/catalogo" className="inline-flex items-center gap-2 bg-[#0A2B4E] text-white px-8 py-3 rounded-lg hover:bg-[#1E4A76] transition-all duration-300 font-semibold">
                Ver todo el catálogo
                <Smartphone size={18} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Sección de Accesorios - NUEVO */}
      <AccessoriesSection 
        title="Accesorios Destacados"
        subtitle="Protege y complementa tu equipo con nuestros accesorios de calidad"
        limit={4}
      />
      
      {/* Servicios de Reparación */}
      {repairServices && repairServices.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-[#0A2B4E] mb-4">Servicios de Reparación</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Reparaciones rápidas y confiables con garantía. Expertos en todas las marcas
              </p>
              <div className="w-24 h-1 bg-[#2E7D32] mx-auto mt-4 rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {repairServices?.map((service, index) => (
                <RepairServiceCard key={service.id} service={service} index={index} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/reparaciones" className="inline-flex items-center gap-2 bg-[#2E7D32] text-white px-8 py-3 rounded-lg hover:bg-[#1B5E20] transition-all duration-300 font-semibold">
                Ver todos los servicios
                <Wrench size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      <BrandsCarousel 
        title="Marcas que reparamos"
        subtitle="Expertos en todas las marcas y modelos, con piezas originales y garantía"
      />
      
      {/* CTA Final */}
      <section className="py-16 bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Necesitas reparar tu equipo?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Agenda tu cita hoy mismo y recibe un diagnóstico gratuito
          </p>
          <CTAButton />
        </div>
      </section>
    </div>
  );
}
