'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BookingCard } from '@/components/admin/reservas/BookingCard';
import { BookingStats } from '@/components/admin/reservas/BookingStats';
import { 
  Search, 
  Filter, 
  X, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';

export default function ReservasPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pendiente: 0,
    confirmada: 0,
    en_proceso: 0,
    completada: 0,
    cancelada: 0,
    thisMonth: 0,
    lastMonth: 0,
  });
  
  const itemsPerPage = 10;
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
    fetchBookings();
  }, [currentPage, searchTerm, statusFilter, typeFilter]);

  const fetchStats = async () => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Obtener todas las reservas con fecha de creación
    const { data: allBookings } = await supabase
      .from('bookings')
      .select('status, created_at');

    if (allBookings) {
      const pendiente = allBookings.filter(b => b.status === 'pendiente').length;
      const confirmada = allBookings.filter(b => b.status === 'confirmada').length;
      const en_proceso = allBookings.filter(b => b.status === 'en_proceso').length;
      const completada = allBookings.filter(b => b.status === 'completada').length;
      const cancelada = allBookings.filter(b => b.status === 'cancelada').length;

      // Estadísticas mensuales - verificar que created_at existe
      const thisMonth = allBookings.filter(b => {
        if (!b.created_at) return false;
        return new Date(b.created_at) >= firstDayThisMonth;
      }).length;

      const lastMonth = allBookings.filter(b => {
        if (!b.created_at) return false;
        return new Date(b.created_at) >= firstDayLastMonth && 
               new Date(b.created_at) <= lastDayLastMonth;
      }).length;

      setStats({
        total: allBookings.length,
        pendiente,
        confirmada,
        en_proceso,
        completada,
        cancelada,
        thisMonth,
        lastMonth,
      });
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    
    let query = supabase
      .from('bookings')
      .select(`
        *,
        product:product_id (name),
        repair_service:repair_service_id (device_type, issue_type)
      `, { count: 'exact' });

    // Aplicar filtros
    if (searchTerm) {
      query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
    }
    if (statusFilter) {
      query = query.eq('status', statusFilter);
    }
    if (typeFilter) {
      query = query.eq('service_type', typeFilter);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setBookings(data);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }
    setLoading(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Teléfono', 'Tipo', 'Estado', 'Fecha', 'Cita', 'Notas'];
    const rows = bookings.map(b => [
      b.id,
      b.customer_name,
      b.customer_email,
      b.customer_phone || '',
      b.service_type === 'compra' ? 'Compra' : 'Reparación',
      b.status,
      b.created_at ? new Date(b.created_at).toLocaleDateString() : '',
      b.appointment_date ? `${b.appointment_date} ${b.appointment_time || ''}` : '',
      b.notes || ''
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reservas-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reservas</h1>
          <p className="text-gray-500 mt-1">Gestiona las solicitudes de compra y reparación</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Download className="w-5 h-5" />
          Exportar CSV
        </button>
      </div>

      {/* Estadísticas */}
      <BookingStats stats={stats} />

      {/* Filtros */}
      <div className="mt-8 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="en_proceso">En proceso</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          <div className="w-40">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
            >
              <option value="">Todos</option>
              <option value="compra">Compra</option>
              <option value="reparacion">Reparación</option>
            </select>
          </div>

          {(searchTerm || statusFilter || typeFilter) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 mt-5"
            >
              <X className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de reservas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2B4E] mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando reservas...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay reservas registradas</p>
          <p className="text-gray-400 text-sm mt-2">
            Las reservas aparecerán aquí cuando los clientes realicen solicitudes
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onStatusChange={() => {
                  fetchBookings();
                  fetchStats();
                }}
              />
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}