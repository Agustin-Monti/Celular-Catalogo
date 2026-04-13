'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ProductCard } from '@/components/home/ProductCard';
import { Product } from '@/types';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Smartphone,
  Star,
  RefreshCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    type: true,
    brand: true,
    price: true,
  });
  
  const [filters, setFilters] = useState({
    type: [] as string[],
    brand: [] as string[],
    minPrice: '',
    maxPrice: '',
  });
  
  const supabase = createClient();
  
  // Configuración de paginación responsive
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 9; // Desktop grande
      if (window.innerWidth >= 768) return 6; // Tablet
      return 6; // Móvil
    }
    return 9; // Default desktop
  };
  
  const [itemsPerPage, setItemsPerPage] = useState(9);
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
  
  // Obtener todas las marcas únicas de los productos (solo celulares)
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allProducts.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    return Array.from(brands).sort();
  }, [allProducts]);
  
  // Obtener tipos únicos (solo celulares)
  const availableTypes = [
    { value: 'nuevo', label: 'Nuevos', color: '#2E7D32', bg: 'bg-green-100' },
    { value: 'usado', label: 'Usados', color: '#FFC107', bg: 'bg-yellow-100' },
    { value: 'reparacion', label: 'Reacondicionados', color: '#0A2B4E', bg: 'bg-blue-100' },
  ];
  
  // Obtener rango de precios
  const priceRange = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 100000 };
    const prices = allProducts.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allProducts]);
  
  // Productos paginados
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return products.slice(start, end);
  }, [products, currentPage, itemsPerPage]);
  
  // Actualizar total de páginas cuando cambian los productos o items por página
  useEffect(() => {
    setTotalPages(Math.ceil(products.length / itemsPerPage));
    setCurrentPage(1); // Resetear a primera página cuando cambian los filtros
  }, [products, itemsPerPage]);
  
  useEffect(() => {
    fetchAllProducts();
  }, []);
  
  useEffect(() => {
    filterProducts();
  }, [filters, allProducts]);
  
  const fetchAllProducts = async () => {
    setLoading(true);
    // Solo traer productos que sean celulares (excluir accesorios)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('type', ['nuevo', 'usado', 'reparacion'])
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAllProducts(data);
      setProducts(data);
    }
    setLoading(false);
  };
  
  const filterProducts = () => {
    let filtered = [...allProducts];
    
    // Filtrar por tipo
    if (filters.type.length > 0) {
      filtered = filtered.filter(product => filters.type.includes(product.type));
    }
    
    // Filtrar por marca
    if (filters.brand.length > 0) {
      filtered = filtered.filter(product => filters.brand.includes(product.brand));
    }
    
    // Filtrar por precio mínimo
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= parseInt(filters.minPrice));
    }
    
    // Filtrar por precio máximo
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= parseInt(filters.maxPrice));
    }
    
    setProducts(filtered);
  };
  
  const clearFilters = () => {
    setFilters({
      type: [],
      brand: [],
      minPrice: '',
      maxPrice: '',
    });
  };
  
  const toggleType = (type: string) => {
    setFilters(prev => ({
      ...prev,
      type: prev.type.includes(type)
        ? prev.type.filter(t => t !== type)
        : [...prev.type, type]
    }));
  };
  
  const toggleBrand = (brand: string) => {
    setFilters(prev => ({
      ...prev,
      brand: prev.brand.includes(brand)
        ? prev.brand.filter(b => b !== brand)
        : [...prev.brand, brand]
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
  
  const activeFiltersCount = filters.type.length + filters.brand.length + 
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0);
  
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
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4">
        {/* Header con título y contador */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-[#0A2B4E]">Catálogo de Celulares</h1>
            <p className="text-gray-500 mt-2">
              {products.length} celular{products.length !== 1 ? 'es' : ''} disponible{products.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex gap-3">
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
                Limpiar filtros ({activeFiltersCount})
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 bg-[#0A2B4E] text-white px-4 py-2 rounded-lg hover:bg-[#1E4A76] transition-colors"
            >
              <SlidersHorizontal size={18} />
              Filtros
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-[#FFC107] text-[#0A2B4E] text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Panel de filtros */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-20">
              {/* Header de filtros móvil */}
              <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Filtro por Tipo */}
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('type')}
                    className="flex justify-between items-center w-full text-left mb-3"
                  >
                    <h4 className="font-semibold text-gray-900">Tipo de equipo</h4>
                    <ChevronDown 
                      size={18} 
                      className={`transform transition-transform ${expandedSections.type ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {expandedSections.type && (
                    <div className="space-y-2">
                      {availableTypes.map((type) => (
                        <label
                          key={type.value}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.type.includes(type.value)}
                            onChange={() => toggleType(type.value)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0A2B4E] focus:ring-[#0A2B4E]"
                          />
                          <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${type.bg}`}>
                            {type.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Filtro por Marca */}
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('brand')}
                    className="flex justify-between items-center w-full text-left mb-3"
                  >
                    <h4 className="font-semibold text-gray-900">Marcas disponibles</h4>
                    <ChevronDown 
                      size={18} 
                      className={`transform transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`}
                    />
                  </button>
                  
                  {expandedSections.brand && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={filters.brand.includes(brand)}
                            onChange={() => toggleBrand(brand)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0A2B4E] focus:ring-[#0A2B4E]"
                          />
                          <span className="text-sm text-gray-700">{brand}</span>
                          <span className="text-xs text-gray-400 ml-auto">
                            {allProducts.filter(p => p.brand === brand).length}
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
                    <ChevronDown 
                      size={18} 
                      className={`transform transition-transform ${expandedSections.price ? 'rotate-180' : ''}`}
                    />
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
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                          <input
                            type="number"
                            value={filters.maxPrice}
                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            placeholder={`$${priceRange.max}`}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      {/* Slider de precio visual */}
                      <div className="pt-2">
                        <div className="relative h-1 bg-gray-200 rounded-full">
                          <div 
                            className="absolute h-full bg-[#0A2B4E] rounded-full"
                            style={{
                              left: `${((parseInt(filters.minPrice) || priceRange.min) - priceRange.min) / (priceRange.max - priceRange.min) * 100}%`,
                              right: `${100 - ((parseInt(filters.maxPrice) || priceRange.max) - priceRange.min) / (priceRange.max - priceRange.min) * 100}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                          <span>${priceRange.min.toLocaleString()}</span>
                          <span>${priceRange.max.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Botón de aplicar filtros en móvil */}
              <div className="lg:hidden p-4 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-[#0A2B4E] text-white py-3 rounded-lg font-semibold"
                >
                  Ver resultados ({products.length})
                </button>
              </div>
            </div>
          </div>
          
          {/* Productos */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2B4E]"></div>
                <p className="text-gray-500 mt-4">Cargando celulares...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Smartphone className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron celulares</p>
                <p className="text-gray-400 text-sm mt-2">Prueba ajustando los filtros de búsqueda</p>
                <button
                  onClick={clearFilters}
                  className="mt-6 inline-flex items-center gap-2 text-[#0A2B4E] hover:text-[#1E4A76] font-semibold"
                >
                  <RefreshCw size={16} />
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              <>
                {/* Filtros activos */}
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filters.type.map(type => {
                      const typeLabel = availableTypes.find(t => t.value === type)?.label;
                      return (
                        <span
                          key={type}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {typeLabel}
                          <button
                            onClick={() => toggleType(type)}
                            className="ml-1 hover:text-blue-900"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                    {filters.brand.map(brand => (
                      <span
                        key={brand}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {brand}
                        <button
                          onClick={() => toggleBrand(brand)}
                          className="ml-1 hover:text-gray-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        ${filters.minPrice || '0'} - ${filters.maxPrice || priceRange.max}
                        <button
                          onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
                          className="ml-1 hover:text-gray-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">
                    Mostrando {paginatedProducts.length} de {products.length} celular{products.length !== 1 ? 'es' : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
      </div>
    </div>
  );
}
