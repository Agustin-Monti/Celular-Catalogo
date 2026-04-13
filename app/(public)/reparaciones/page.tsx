'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { RepairService } from '@/types';
import { ServiceCard } from '@/components/home/ServiceCard';
import { SkeletonCard } from '@/components/ui/SkeletonCard';
import { 
  Wrench, 
  Filter, 
  X, 
  ChevronDown,
  Clock,
  Shield,
  Search,
  Sparkles,
  Grid3x3,
  LayoutGrid,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ReparacionesPage() {
  const [services, setServices] = useState<RepairService[]>([]);
  const [allServices, setAllServices] = useState<RepairService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'name_asc' | 'popular'>('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    deviceType: true,
    issueType: true,
    price: true,
  });
  
  const [filters, setFilters] = useState({
    deviceType: [] as string[],
    issueType: [] as string[],
    minPrice: '',
    maxPrice: '',
  });
  
  const supabase = createClient();
  
  // Configuración de paginación responsive
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 6; // Desktop: 2 columnas x 3 filas
      if (window.innerWidth >= 768) return 4; // Tablet: 2 columnas x 2 filas
      return 4; // Móvil: 1 columna x 4 filas
    }
    return 6; // Default desktop
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  
  // Actualizar items por página al cambiar tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(getItemsPerPage());
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Obtener tipos de dispositivo únicos
  const availableDeviceTypes = useMemo(() => {
    const types = new Set<string>();
    allServices.forEach(service => {
      if (service.device_type) {
        types.add(service.device_type);
      }
    });
    return Array.from(types).sort();
  }, [allServices]);
  
  // Obtener tipos de problema únicos
  const availableIssueTypes = useMemo(() => {
    const issues = new Set<string>();
    allServices.forEach(service => {
      if (service.issue_type) {
        issues.add(service.issue_type);
      }
    });
    return Array.from(issues).sort();
  }, [allServices]);
  
  // Obtener rango de precios
  const priceRange = useMemo(() => {
    if (allServices.length === 0) return { min: 0, max: 5000 };
    const prices = allServices.map(s => s.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allServices]);
  
  // Servicios paginados
  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return services.slice(start, end);
  }, [services, currentPage, itemsPerPage]);
  
  // Actualizar total de páginas cuando cambian los servicios o items por página
  useEffect(() => {
    setTotalPages(Math.ceil(services.length / itemsPerPage));
    setCurrentPage(1); // Resetear a primera página cuando cambian los filtros
  }, [services, itemsPerPage]);
  
  useEffect(() => {
    fetchAllServices();
  }, []);
  
  useEffect(() => {
    filterServices();
  }, [filters, searchTerm, sortBy, allServices]);
  
  const fetchAllServices = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('repair_services')
      .select('*')
      .eq('is_available', true)
      .order('price', { ascending: true });
    
    if (!error && data) {
      setAllServices(data);
      setServices(data);
    }
    setLoading(false);
  };
  
  const filterServices = () => {
    let filtered = [...allServices];
    
    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(service => 
        service.device_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.issue_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtrar por tipo de dispositivo
    if (filters.deviceType.length > 0) {
      filtered = filtered.filter(service => 
        filters.deviceType.includes(service.device_type)
      );
    }
    
    // Filtrar por tipo de problema
    if (filters.issueType.length > 0) {
      filtered = filtered.filter(service => 
        filters.issueType.includes(service.issue_type)
      );
    }
    
    // Filtrar por precio mínimo
    if (filters.minPrice) {
      filtered = filtered.filter(service => service.price >= parseInt(filters.minPrice));
    }
    
    // Filtrar por precio máximo
    if (filters.maxPrice) {
      filtered = filtered.filter(service => service.price <= parseInt(filters.maxPrice));
    }
    
    // Ordenamiento
    if (sortBy === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name_asc') {
      filtered.sort((a, b) => a.device_type.localeCompare(b.device_type));
    } else if (sortBy === 'popular') {
      // Simular popularidad - en producción podrías usar un campo de popularidad
      filtered.sort((a, b) => (b.warranty_days - a.warranty_days));
    }
    
    setServices(filtered);
  };
  
  const clearFilters = () => {
    setFilters({
      deviceType: [],
      issueType: [],
      minPrice: '',
      maxPrice: '',
    });
    setSearchTerm('');
  };
  
  const toggleDeviceType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      deviceType: prev.deviceType.includes(type)
        ? prev.deviceType.filter(t => t !== type)
        : [...prev.deviceType, type]
    }));
  };
  
  const toggleIssueType = (issue: string) => {
    setFilters(prev => ({
      ...prev,
      issueType: prev.issueType.includes(issue)
        ? prev.issueType.filter(i => i !== issue)
        : [...prev.issueType, issue]
    }));
  };
  
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const activeFiltersCount = filters.deviceType.length + filters.issueType.length + 
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) +
    (searchTerm ? 1 : 0);
  
  // Generar números de página para mostrar
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-2xl mb-4 shadow-lg">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0A2B4E] mb-4">
            Servicios de Reparación
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Reparaciones rápidas y confiables con garantía. Expertos en todas las marcas y modelos.
            Diagnóstico sin costo y los mejores precios del mercado.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#FFC107] to-[#2E7D32] mx-auto mt-4 rounded-full"></div>
        </div>
        
        {/* Barra de búsqueda */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por dispositivo o problema (ej: iPhone, pantalla, batería)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent transition-all duration-300"
            />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel de filtros */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-20">
              <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Filtro por Tipo de Dispositivo */}
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('deviceType')}
                    className="flex justify-between items-center w-full text-left mb-3"
                  >
                    <h4 className="font-semibold text-gray-900">Tipo de dispositivo</h4>
                    <ChevronDown size={18} className={`transform transition-transform ${expandedSections.deviceType ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedSections.deviceType && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableDeviceTypes.map((type) => (
                        <label key={type} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.deviceType.includes(type)}
                            onChange={() => toggleDeviceType(type)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0A2B4E] focus:ring-[#0A2B4E]"
                          />
                          <span className="text-sm text-gray-700">{type}</span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {allServices.filter(s => s.device_type === type).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Filtro por Tipo de Problema */}
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('issueType')}
                    className="flex justify-between items-center w-full text-left mb-3"
                  >
                    <h4 className="font-semibold text-gray-900">Tipo de problema</h4>
                    <ChevronDown size={18} className={`transform transition-transform ${expandedSections.issueType ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedSections.issueType && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableIssueTypes.map((issue) => (
                        <label key={issue} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.issueType.includes(issue)}
                            onChange={() => toggleIssueType(issue)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0A2B4E] focus:ring-[#0A2B4E]"
                          />
                          <span className="text-sm text-gray-700">{issue}</span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {allServices.filter(s => s.issue_type === issue).length}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Filtro por Precio */}
                <div>
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex justify-between items-center w-full text-left mb-3"
                  >
                    <h4 className="font-semibold text-gray-900">Rango de precio</h4>
                    <ChevronDown size={18} className={`transform transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedSections.price && (
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                          <input
                            type="number"
                            value={filters.minPrice}
                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            placeholder={`$${priceRange.min}`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E]"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                          <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            placeholder={`$${priceRange.max}`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="lg:hidden p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-[#0A2B4E] text-white py-3 rounded-lg font-semibold"
                >
                  Ver resultados ({services.length})
                </button>
              </div>
            </div>
          </div>
          
          {/* Lista de servicios */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 bg-[#0A2B4E] text-white px-4 py-2 rounded-lg"
                >
                  <Filter size={18} />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 bg-[#FFC107] text-[#0A2B4E] text-xs font-bold px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
                
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                  >
                    <X size={16} />
                    Limpiar filtros ({activeFiltersCount})
                  </button>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Ordenar por:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0A2B4E]"
                  >
                    <option value="popular">Más popular</option>
                    <option value="price_asc">Menor precio</option>
                    <option value="price_desc">Mayor precio</option>
                    <option value="name_asc">Nombre A-Z</option>
                  </select>
                </div>
                
                <div className="flex items-center gap-1 border-l border-gray-200 pl-3">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[#0A2B4E] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <Grid3x3 size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#0A2B4E] text-white' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <LayoutGrid size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Filtros activos - Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {filters.deviceType.map(type => (
                  <span key={type} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {type}
                    <button onClick={() => toggleDeviceType(type)} className="ml-1 hover:text-blue-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {filters.issueType.map(issue => (
                  <span key={issue} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {issue}
                    <button onClick={() => toggleIssueType(issue)} className="ml-1 hover:text-purple-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
                {(filters.minPrice || filters.maxPrice) && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    ${filters.minPrice || '0'} - ${filters.maxPrice || priceRange.max}
                    <button onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })} className="ml-1 hover:text-green-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    Buscar: "{searchTerm}"
                    <button onClick={() => setSearchTerm('')} className="ml-1 hover:text-gray-900">
                      <X size={14} />
                    </button>
                  </span>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm text-gray-500">
                Mostrando {paginatedServices.length} de {services.length} servicio{services.length !== 1 ? 's' : ''}
              </p>
              <p className="text-sm text-gray-500">
                Página {currentPage} de {totalPages}
              </p>
            </div>
            
            {loading ? (
              <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1 gap-4'}`}>
                {[1, 2, 3, 4].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Wrench className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron servicios</p>
                <p className="text-gray-400 text-sm mt-2">Prueba ajustando los filtros de búsqueda</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 text-[#0A2B4E] hover:text-[#1E4A76] font-semibold"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <>
                <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 gap-6' : 'grid-cols-1 gap-4'}`}>
                  {paginatedServices.map((service, index) => (
                    <ServiceCard key={service.id} service={service} index={index} />
                  ))}
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex gap-1">
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[44px] h-11 px-3 rounded-lg font-medium transition-all duration-200 ${
                            currentPage === page
                              ? 'bg-[#0A2B4E] text-white shadow-md'
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Beneficios adicionales */}
        <div className="mt-16 bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] rounded-2xl p-8 text-white">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Servicio Express</h3>
              <p className="text-sm text-gray-200">Reparaciones en menos de 2 horas en la mayoría de los casos</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Garantía Garantizada</h3>
              <p className="text-sm text-gray-200">Hasta 6 meses de garantía en todas nuestras reparaciones</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-2">Diagnóstico Gratuito</h3>
              <p className="text-sm text-gray-200">Evaluación sin costo antes de realizar cualquier reparación</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
