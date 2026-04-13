'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RepairService } from '@/types';
import { 
  Wrench, 
  Clock, 
  Shield, 
  TrendingUp,
  Phone, 
  Smartphone,
  Battery,
  Droplet,
  Volume2,
  Camera,
  HardDrive,
  Zap
} from 'lucide-react';
import { RatingStars } from '@/components/ui/RatingStars';

interface RepairServiceCardProps {
  service: RepairService;
  index?: number;
  showBooking?: boolean;
  variant?: 'home' | 'detail';
}

export function RepairServiceCard({ service, index = 0, variant = 'home' }: RepairServiceCardProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  const getIssueIcon = (issue: string) => {
    const issueLower = issue.toLowerCase();
    if (issueLower.includes('batería') || issueLower.includes('bateria')) return Battery;
    if (issueLower.includes('pantalla')) return Smartphone;
    if (issueLower.includes('cámara')) return Camera;
    if (issueLower.includes('audio') || issueLower.includes('micro')) return Volume2;
    if (issueLower.includes('agua') || issueLower.includes('humedad')) return Droplet;
    if (issueLower.includes('software')) return HardDrive;
    if (issueLower.includes('carga')) return Zap;
    return Wrench;
  };
  
  const IssueIcon = getIssueIcon(service.issue_type);
  
  const formatNumber = (num: number) => {
    if (!isClient) return num.toString();
    return new Intl.NumberFormat('es-MX').format(num);
  };
  
  // Determinar si es popular
  const isPopular = service.issue_type === 'Cambio de batería' || 
                    service.issue_type === 'Cambio de pantalla' ||
                    index < 2;
  
  // Para la página de detalle, mostrar el botón que abre el formulario
  // Para la página principal, el botón lleva al detalle
  if (variant === 'detail') {
    return (
      <div className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Badge de popular */}
        {isPopular && (
          <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#FFC107] to-[#FFD700] text-[#0A2B4E] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3 h-3" />
            Más popular
          </div>
        )}
        
        <div className="p-5">
          {/* Header con icono y título */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFC107]/20 to-[#2E7D32]/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IssueIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                    {service.device_type}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                    {service.issue_type}
                  </p>
                </div>
                <div className="bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {service.warranty_days > 0 ? `${service.warranty_days} días` : 'Sin garantía'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating y estadísticas */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <RatingStars rating={4.5} size="sm" />
              <span className="text-xs text-gray-400">(35)</span>
            </div>
          </div>
          
          {/* Detalles del servicio */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-[#FFC107]" />
                <span>Tiempo estimado</span>
              </div>
              <span className="font-medium text-gray-900">{service.estimated_time}</span>
            </div>
            
            {service.warranty_days > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4 text-[#2E7D32]" />
                  <span>Garantía</span>
                </div>
                <span className="font-medium text-gray-900">{service.warranty_days} días</span>
              </div>
            )}
          </div>
          
          {/* Precio y CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-end justify-between mb-3">
              <div className="text-right">
                <p className="text-xs text-gray-400">*Precio sujeto a diagnóstico</p>
              </div>
            </div>
            
            <button
              onClick={() => {
                // Disparar evento para abrir modal de reserva
                const event = new CustomEvent('openBookingModal', { detail: { service } });
                window.dispatchEvent(event);
              }}
              className="w-full bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] text-white py-2.5 rounded-xl hover:from-[#1E4A76] hover:to-[#0A2B4E] transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg group-hover:scale-[1.02]"
            >
              <Wrench size={18} />
              Solicitar servicio
              <span className="text-xs opacity-75">→</span>
            </button>
          </div>
        </div>
        
        {/* Borde decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC107] via-[#2E7D32] to-[#0A2B4E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    );
  }
  
  // Versión para la página principal - el botón lleva al detalle
  return (
    <Link href={`/reparaciones/${service.id}`} className="block group">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
        {/* Badge de popular */}
        {isPopular && (
          <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-[#FFC107] to-[#FFD700] text-[#0A2B4E] text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <TrendingUp className="w-3 h-3" />
            Más popular
          </div>
        )}
        
        <div className="p-5 relative">
          {/* Header con icono y título */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#FFC107]/20 to-[#2E7D32]/20 rounded-xl blur-sm group-hover:blur-md transition-all duration-300"></div>
              <div className="relative w-14 h-14 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <IssueIcon className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-1">
                    {service.device_type}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                    {service.issue_type}
                  </p>
                </div>
                <div className="bg-[#2E7D32]/10 text-[#2E7D32] text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                  {service.warranty_days > 0 ? `${service.warranty_days} días` : 'Sin garantía'}
                </div>
              </div>
            </div>
          </div>
          
          {/* Rating y estadísticas */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <RatingStars rating={4.5} size="sm" />
              <span className="text-xs text-gray-500">(50)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Shield className="w-3 h-3" />
              <span>+35 reparaciones</span>
            </div>
          </div>
          
          {/* Detalles del servicio */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-[#FFC107]" />
                <span>Tiempo estimado</span>
              </div>
              <span className="font-medium text-gray-900">{service.estimated_time}</span>
            </div>
            
            {service.warranty_days > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Shield className="w-4 h-4 text-[#2E7D32]" />
                  <span>Garantía</span>
                </div>
                <span className="font-medium text-gray-900">{service.warranty_days} días</span>
              </div>
            )}
          </div>
          
          {/* Precio y CTA */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-end justify-between mb-3">
              <div>
                <div className="flex items-baseline gap-1">
                  <p className="text-xs text-gray-500 mt-1">*Precio sujeto a diagnóstico</p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] text-white py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-md group-hover:from-[#1E4A76] group-hover:to-[#0A2B4E] transition-all duration-300">
              <Wrench size={18} />
              Ver detalles
              <span className="text-xs opacity-75">→</span>
            </div>
          </div>
        </div>
        
        {/* Borde decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FFC107] via-[#2E7D32] to-[#0A2B4E] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
      </div>
    </Link>
  );
}
