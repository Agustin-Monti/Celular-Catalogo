import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RepairService } from '@/types';
import { RatingStars } from '@/components/ui/RatingStars';
import { 
  Wrench, 
  Clock, 
  Shield, 
  CheckCircle,
  ArrowLeft,
  Smartphone,
  Battery,
  Camera,
  Volume2,
  Droplet,
  HardDrive,
  Zap,
  MessageCircle,
  Truck,
  Award,
  Calendar,
  ChevronDown,
  Star,
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ReparacionPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: service, error } = await supabase
    .from('repair_services')
    .select('*')
    .eq('id', id)
    .single<RepairService>();
  
  if (error || !service) {
    notFound();
  }
  
  // Obtener servicios relacionados (mismo dispositivo o mismo tipo de problema)
  const { data: relatedServices } = await supabase
    .from('repair_services')
    .select('*')
    .neq('id', id)
    .eq('is_available', true)
    .or(`device_type.eq.${service.device_type},issue_type.eq.${service.issue_type}`)
    .limit(3);
  
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
  
  const whatsappNumber = "521234567890";
  const whatsappMessage = encodeURIComponent(
    `Hola, me interesa el servicio de reparación:\n\n` +
    `Dispositivo: ${service.device_type}\n` +
    `Problema: ${service.issue_type}\n` +
    `Tiempo estimado: ${service.estimated_time}\n` +
    `Garantía: ${service.warranty_days} días\n\n` +
    `¿Podrían darme más información y agendar una cita?`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;
  
  const faqs = [
    { 
      q: '¿Qué incluye el diagnóstico?', 
      a: 'El diagnóstico incluye una revisión completa del equipo para identificar la falla exacta. Es completamente gratuito y sin compromiso.' 
    },
    { 
      q: '¿Cuánto tiempo tarda la reparación?', 
      a: `El tiempo estimado para ${service.issue_type} es de ${service.estimated_time}. En caso de requerir piezas especiales, te informaremos oportunamente.` 
    },
    { 
      q: '¿La garantía cubre qué?', 
      a: `La garantía de ${service.warranty_days} días cubre la reparación realizada y las piezas reemplazadas. No cubre daños físicos posteriores o por mal uso.` 
    },
    { 
      q: '¿Qué métodos de pago aceptan?', 
      a: 'Aceptamos efectivo, tarjetas de crédito/débito, transferencia bancaria y pagos con tarjeta en mensualidades.' 
    },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 text-sm">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="text-gray-500 hover:text-[#0A2B4E]">
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/reparaciones" className="text-gray-500 hover:text-[#0A2B4E]">
                Reparaciones
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-[#0A2B4E] font-medium">
              {service.device_type} - {service.issue_type}
            </li>
          </ol>
        </nav>
        
        <div className="max-w-4xl mx-auto">
          {/* Tarjeta principal */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] p-8 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-white/20 p-3 rounded-xl">
                  <IssueIcon className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">{service.device_type}</h1>
                  <p className="text-gray-200">{service.issue_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4">
                <RatingStars rating={4.8} size="lg" />
                <span className="text-sm text-gray-300">(128 valoraciones)</span>
              </div>
            </div>
            
            <div className="p-8">
              {/* Detalles del servicio */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Clock className="h-6 w-6 text-[#FFC107]" />
                    <div>
                      <p className="text-sm text-gray-500">Tiempo estimado</p>
                      <p className="font-semibold text-gray-900">{service.estimated_time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Shield className="h-6 w-6 text-[#2E7D32]" />
                    <div>
                      <p className="text-sm text-gray-500">Garantía</p>
                      <p className="font-semibold text-gray-900">{service.warranty_days} días</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Wrench className="h-6 w-6 text-[#0A2B4E]" />
                    <div>
                      <p className="text-sm text-gray-500">Precio</p>
                      <p className="font-semibold text-[#0A2B4E]">
                        *Precio sujeto a diagnóstico
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <Calendar className="h-6 w-6 text-[#FFC107]" />
                    <div>
                      <p className="text-sm text-gray-500">Disponibilidad</p>
                      <p className="font-semibold text-gray-900">Agenda tu cita hoy mismo</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Beneficios */}
              <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Beneficios del servicio</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
                    <span>Diagnóstico sin costo</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
                    <span>Piezas originales</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
                    <span>Servicio express</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
                    <span>Garantía incluida</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
                    <span>Técnicos certificados</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-[#2E7D32]" />
                    <span>Presupuesto sin compromiso</span>
                  </div>
                </div>
              </div>
              
              {/* Preguntas frecuentes */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preguntas frecuentes</h3>
                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <details key={idx} className="group">
                      <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="font-medium text-gray-900">{faq.q}</span>
                        <ChevronDown className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform" />
                      </summary>
                      <p className="mt-2 p-3 text-sm text-gray-600 bg-white rounded-lg border border-gray-100">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
              
              {/* Servicios relacionados */}
              {relatedServices && relatedServices.length > 0 && (
                <div className="mb-8 pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Otros servicios que podrían interesarte</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {relatedServices.slice(0, 3).map((related) => (
                      <Link
                        key={related.id}
                        href={`/reparaciones/${related.id}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-8 h-8 bg-[#0A2B4E]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0A2B4E]/20 transition-colors">
                          <Wrench className="w-4 h-4 text-[#0A2B4E]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{related.device_type}</p>
                          <p className="text-xs text-gray-500">{related.issue_type}</p>
                        </div>
                        <div className="w-8 h-8 bg-[#0A2B4E]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0A2B4E]/20 transition-colors">
                          <Eye className="w-4 h-4 text-[#0A2B4E]" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Botón de WhatsApp */}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ¿Necesitas este servicio?
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Contáctanos por WhatsApp para agendar tu cita y obtener más información
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-[#25D366] hover:bg-[#20b859] text-white py-3 rounded-lg flex items-center justify-center gap-3 font-semibold transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <MessageCircle size={22} />
                  Agendar reparación por WhatsApp
                </a>
                <p className="text-xs text-gray-400 text-center mt-3">
                  *Tiempo de respuesta: 5-10 minutos en horario laboral
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}