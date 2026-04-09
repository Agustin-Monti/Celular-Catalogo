import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ImageGallery } from '@/components/ImageGallery';
import { Product } from '@/types';
import { 
  Smartphone, 
  Star, 
  CheckCircle, 
  Battery, 
  Cpu, 
  HardDrive, 
  Camera, 
  Shield,
  ArrowLeft,
  Wifi,
  Bluetooth,
  ChevronRight,
  Truck,
  Award,
  Clock,
  MessageCircle,
  Package
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Specification {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

interface TypeConfig {
  color: string;
  bg: string;
  text: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export default async function ProductoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single<Product>();
  
  if (error || !product) {
    notFound();
  }
  
  // Verificar si es un celular o accesorio
  const isPhone = ['nuevo', 'usado', 'reparacion'].includes(product.type);
  const isAccessory = product.type === 'accesorio';
  
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .neq('id', id)
    .or(`brand.eq.${product.brand},type.eq.${product.type}`)
    .limit(4) as { data: Product[] | null };
  
  const getTypeConfig = (): TypeConfig => {
    if (isAccessory) {
      return { 
        color: '#FFC107', 
        bg: 'bg-orange-100', 
        text: 'text-orange-800', 
        label: 'Accesorio',
        icon: <Package className="h-5 w-5" />,
        description: 'Accesorio original de alta calidad'
      };
    }
    
    switch(product.type) {
      case 'nuevo':
        return { 
          color: '#2E7D32', 
          bg: 'bg-green-100', 
          text: 'text-green-800', 
          label: 'Nuevo',
          icon: <CheckCircle className="h-5 w-5" />,
          description: 'Equipo nuevo, sellado de fábrica con garantía oficial'
        };
      case 'usado':
        return { 
          color: '#FFC107', 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800', 
          label: 'Usado - Excelente',
          icon: <Star className="h-5 w-5" />,
          description: 'Equipo revisado y certificado, en excelentes condiciones'
        };
      case 'reparacion':
        return { 
          color: '#0A2B4E', 
          bg: 'bg-blue-100', 
          text: 'text-blue-800', 
          label: 'Reacondicionado',
          icon: <Shield className="h-5 w-5" />,
          description: 'Equipo reacondicionado con piezas originales, como nuevo'
        };
      default:
        return { 
          color: '#6B7280', 
          bg: 'bg-gray-100', 
          text: 'text-gray-800', 
          label: 'General',
          icon: <Smartphone className="h-5 w-5" />,
          description: 'Consulta las características del equipo'
        };
    }
  };
  
  const typeConfig = getTypeConfig();
  
  // Solo crear especificaciones para celulares
  const specifications: Specification[] = isPhone ? [
    { icon: Smartphone, label: 'Marca', value: product.brand },
    { icon: Smartphone, label: 'Modelo', value: product.model },
    { icon: HardDrive, label: 'Almacenamiento', value: product.specs?.storage || 'No especificado' },
    { icon: Cpu, label: 'RAM', value: product.specs?.ram || 'No especificado' },
    { icon: Camera, label: 'Cámara', value: product.specs?.camera || 'No especificado' },
    { icon: Battery, label: 'Batería', value: product.specs?.battery || 'No especificado' },
    { icon: Wifi, label: 'Conectividad', value: '4G / 5G / WiFi 6' },
    { icon: Bluetooth, label: 'Bluetooth', value: '+5.0' },
  ] : [];

  // Generar mensaje para WhatsApp
  const whatsappNumber = "521234567890";
  const whatsappMessage = encodeURIComponent(
    isAccessory
      ? `Hola, me interesa el accesorio: ${product.name}\n` +
        `Marca: ${product.brand}\n` +
        `Precio: $${product.price.toLocaleString('es-MX')}\n` +
        `Link: ${process.env.NEXT_PUBLIC_APP_URL}/producto/${product.id}\n\n` +
        `¿Podrían darme más información?`
      : `Hola, me interesa el producto: ${product.name}\n` +
        `Marca: ${product.brand}\n` +
        `Modelo: ${product.model}\n` +
        `Precio: $${product.price.toLocaleString('es-MX')}\n` +
        `Tipo: ${typeConfig.label}\n` +
        `Link: ${process.env.NEXT_PUBLIC_APP_URL}/producto/${product.id}\n\n` +
        `¿Podrían darme más información?`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header con navegación */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href={isAccessory ? "/accesorios" : "/catalogo"}
            className="inline-flex items-center gap-2 text-[#0A2B4E] hover:text-[#1E4A76] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver a {isAccessory ? "accesorios" : "catálogo"}</span>
          </Link>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Grid con altura igual usando items-stretch */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12 items-stretch">
          {/* Galería de imágenes */}
          <div className="flex">
            <div className="w-full">
              <ImageGallery 
                images={product.images || []} 
                productName={product.name}
              />
            </div>
          </div>
          
          {/* Información del producto */}
          <div className="flex">
            <div className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`${typeConfig.bg} ${typeConfig.text} text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1`}>
                  {typeConfig.icon}
                  {typeConfig.label}
                </span>
                {product.is_featured && (
                  <span className="bg-[#FFC107] text-[#0A2B4E] text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Star size={14} fill="currentColor" />
                    Destacado
                  </span>
                )}
                {product.stock > 0 ? (
                  <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
                    Disponible
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
                    Agotado
                  </span>
                )}
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-600 mb-4">{product.brand} {!isAccessory && product.model}</p>
              
              {/* Descripción */}
              {product.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}
              
              {/* Especificaciones para accesorios (si tiene specs) */}
              {isAccessory && product.specs && Object.keys(product.specs).length > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-2">Especificaciones</h3>
                  <div className="space-y-1">
                    {product.specs.compatible && (
                      <p className="text-sm text-gray-600">📱 Compatible con: {product.specs.compatible}</p>
                    )}
                    {product.specs.material && (
                      <p className="text-sm text-gray-600">📦 Material: {product.specs.material}</p>
                    )}
                    {product.specs.color && (
                      <p className="text-sm text-gray-600">🎨 Color: {product.specs.color}</p>
                    )}
                    {product.specs.potencia && (
                      <p className="text-sm text-gray-600">⚡ Potencia: {product.specs.potencia}</p>
                    )}
                    {product.specs.longitud && (
                      <p className="text-sm text-gray-600">📏 Longitud: {product.specs.longitud}</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Precio */}
              <div className="mb-6">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#0A2B4E]">
                    ${product.price.toLocaleString('es-MX')}
                  </span>
                  {product.original_price && (
                    <span className="text-lg text-gray-400 line-through">
                      ${product.original_price.toLocaleString('es-MX')}
                    </span>
                  )}
                </div>
                {product.type === 'reparacion' && (
                  <div className="flex items-center gap-2 mt-2 text-[#2E7D32]">
                    <Shield size={16} />
                    <span className="text-sm font-medium">6 meses de garantía</span>
                  </div>
                )}
                {product.condition && (
                  <p className="text-sm text-gray-500 mt-2">
                    Condición: {product.condition}
                  </p>
                )}
              </div>
              
              {/* Beneficios */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Truck size={16} className="text-[#2E7D32]" />
                  <span>Envío gratis</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield size={16} className="text-[#2E7D32]" />
                  <span>Garantía incluida</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-[#2E7D32]" />
                  <span>Entrega 24-48h</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Award size={16} className="text-[#2E7D32]" />
                  <span>Calidad garantizada</span>
                </div>
              </div>
              
              {/* Botón de WhatsApp */}
              <div className="border-t border-gray-100 pt-6 mt-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ¿Te interesa este {isAccessory ? 'accesorio' : 'equipo'}?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contáctanos por WhatsApp para consultar disponibilidad y obtener más información
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20b859] text-white py-3 rounded-lg flex items-center justify-center gap-3 font-semibold transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <MessageCircle size={22} />
                  Consultar disponibilidad por WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Especificaciones técnicas - SOLO PARA CELULARES */}
        {isPhone && specifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Especificaciones técnicas</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {specifications.map((spec, idx: number) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <spec.icon className="h-5 w-5 text-[#0A2B4E]" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">{spec.label}</p>
                    <p className="text-sm font-medium text-gray-900">{spec.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Productos relacionados */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((related: Product) => (
                <RelatedProductCard key={related.id} product={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para productos relacionados
interface RelatedProductCardProps {
  product: Product;
}

function RelatedProductCard({ product }: RelatedProductCardProps) {
  const isAccessory = product.type === 'accesorio';
  
  return (
    <Link href={`/producto/${product.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full">
        <div className="relative h-40 bg-gray-100">
          {product.images && product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-2"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              {isAccessory ? (
                <Package className="h-12 w-12 text-gray-400" />
              ) : (
                <Smartphone className="h-12 w-12 text-gray-400" />
              )}
            </div>
          )}
          {isAccessory && (
            <div className="absolute top-2 right-2 bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
              Accesorio
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{product.brand}</p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#0A2B4E]">
              ${product.price.toLocaleString('es-MX')}
            </span>
            <ChevronRight size={18} className="text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}