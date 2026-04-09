'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { 
  Calendar, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock as ClockIcon,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: 'reparacion' | 'compra';
  product_id?: string;
  repair_service_id?: string;
  status: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  created_at: string;
  product?: { name: string };
  repair_service?: { device_type: string; issue_type: string };
}

interface BookingCardProps {
  booking: Booking;
  onStatusChange: () => void;
}

const statusColors = {
  pendiente: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon, label: 'Pendiente' },
  confirmada: { bg: 'bg-blue-100', text: 'text-blue-800', icon: CheckCircle, label: 'Confirmada' },
  completada: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Completada' },
  cancelada: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'Cancelada' },
  en_proceso: { bg: 'bg-purple-100', text: 'text-purple-800', icon: ClockIcon, label: 'En proceso' },
};

const statusOptions = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'en_proceso', label: 'En proceso' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada', label: 'Cancelada' },
];

export function BookingCard({ booking, onStatusChange }: BookingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const supabase = createClient();

  const statusConfig = statusColors[booking.status as keyof typeof statusColors] || statusColors.pendiente;
  const StatusIcon = statusConfig.icon;

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', booking.id);

    if (!error) {
      onStatusChange();
    }
    setUpdating(false);
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return 'No especificada';
    try {
      return new Date(date).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getServiceInfo = () => {
    if (booking.service_type === 'compra' && booking.product) {
      return {
        title: 'Compra de producto',
        description: booking.product.name,
        icon: '🛍️'
      };
    }
    if (booking.service_type === 'reparacion' && booking.repair_service) {
      return {
        title: `Reparación - ${booking.repair_service.device_type}`,
        description: booking.repair_service.issue_type,
        icon: '🔧'
      };
    }
    return {
      title: booking.service_type === 'compra' ? 'Consulta de producto' : 'Consulta de reparación',
      description: 'Información no disponible',
      icon: booking.service_type === 'compra' ? '🛍️' : '🔧'
    };
  };

  const serviceInfo = getServiceInfo();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-lg flex items-center justify-center text-white text-xl">
              {serviceInfo.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{booking.customer_name}</h3>
              <p className="text-xs text-gray-500">ID: {booking.id.slice(0, 8)}...</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.bg} ${statusConfig.text}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Información básica */}
      <div className="p-5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>{booking.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4 text-gray-400" />
            <span>{booking.customer_email}</span>
          </div>
          {booking.customer_phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{booking.customer_phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(booking.created_at)}</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Servicio solicitado</p>
          <p className="text-sm font-medium text-gray-900">{serviceInfo.title}</p>
          <p className="text-xs text-gray-600 mt-0.5">{serviceInfo.description}</p>
        </div>

        {booking.appointment_date && (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="font-medium">Cita agendada:</span>
            <span>{formatDate(booking.appointment_date)}</span>
            {booking.appointment_time && (
              <>
                <Clock className="w-4 h-4 text-blue-500 ml-2" />
                <span>{booking.appointment_time}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Detalles expandidos */}
      {expanded && (
        <div className="p-5 border-t border-gray-100 bg-gray-50">
          {booking.notes && (
            <div className="mb-4">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4" />
                <span>Notas adicionales</span>
              </div>
              <p className="text-sm text-gray-600 bg-white rounded-lg p-3">{booking.notes}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cambiar estado
            </label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={updating || booking.status === option.value}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    booking.status === option.value
                      ? 'bg-[#0A2B4E] text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:border-[#0A2B4E] hover:text-[#0A2B4E]'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}