'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RepairService } from '@/types';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Wrench,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Eye
} from 'lucide-react';

export default function ServiciosPage() {
  const [services, setServices] = useState<RepairService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ 
    show: boolean; 
    service: RepairService | null;
    deleting: boolean;
  }>({
    show: false,
    service: null,
    deleting: false,
  });
  
  const itemsPerPage = 10;
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, [currentPage, searchTerm]);

  const fetchServices = async () => {
    setLoading(true);
    
    let query = supabase
      .from('repair_services')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.or(`device_type.ilike.%${searchTerm}%,issue_type.ilike.%${searchTerm}%`);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await query
      .order('price', { ascending: true })
      .range(from, to);

    if (!error && data) {
      setServices(data);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteModal.service) return;

    setDeleteModal(prev => ({ ...prev, deleting: true }));

    try {
      const { error } = await supabase
        .from('repair_services')
        .delete()
        .eq('id', deleteModal.service.id);

      if (error) throw error;

      fetchServices();
      setDeleteModal({ show: false, service: null, deleting: false });
    } catch (err: any) {
      console.error('Error al eliminar servicio:', err);
      alert('Error al eliminar el servicio: ' + err.message);
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  const getStatusBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Disponible
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        No disponible
      </span>
    );
  };

  const getDeviceIcon = (deviceType: string) => {
    const deviceLower = deviceType.toLowerCase();
    if (deviceLower.includes('iphone')) return '📱';
    if (deviceLower.includes('samsung')) return '📱';
    return '🔧';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Servicios de reparación</h1>
          <p className="text-gray-500 mt-1">Gestiona los servicios técnicos ofrecidos</p>
        </div>
        <Link
          href="/admin/servicios/nuevo"
          className="flex items-center gap-2 bg-[#0A2B4E] text-white px-4 py-2 rounded-lg hover:bg-[#1E4A76] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo servicio
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por dispositivo o tipo de problema..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de servicios */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2B4E] mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando servicios...</p>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay servicios registrados</p>
          <Link
            href="/admin/servicios/nuevo"
            className="inline-block mt-4 text-[#0A2B4E] hover:underline"
          >
            Crear el primer servicio
          </Link>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servicio
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Problema
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tiempo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Garantía
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-lg">{getDeviceIcon(service.device_type)}</span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {service.device_type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{service.issue_type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          ${service.price.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-[#FFC107]" />
                          <span>{service.estimated_time}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Shield className="w-4 h-4 text-[#2E7D32]" />
                          <span>{service.warranty_days} días</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(service.is_available)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/reparaciones/${service.id}`}
                            target="_blank"
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/servicios/editar/${service.id}`}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, service, deleting: false })}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Modal de confirmación de eliminación */}
      {deleteModal.show && deleteModal.service && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar el servicio <strong className="text-gray-900">{deleteModal.service.device_type} - {deleteModal.service.issue_type}</strong>?
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Esta acción eliminará permanentemente el servicio de la base de datos. No se puede deshacer.
            </p>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, service: null, deleting: false })}
                disabled={deleteModal.deleting}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteModal.deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleteModal.deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar servicio
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}