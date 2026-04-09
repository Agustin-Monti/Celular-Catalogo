'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import { AccessoryCard } from '@/components/home/AccessoryCard';
import { 
  Filter, 
  X, 
  ChevronDown, 
  Package,
  RefreshCw,
  SlidersHorizontal,
  Battery,
  Shield,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function AccesoriosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
  });
  
  const [filters, setFilters] = useState({
    category: [] as string[],
    brand: [] as string[],
    minPrice: '',
    maxPrice: '',
  });
  
  const supabase = createClient();
  
  // Configuración de paginación responsive
  const getItemsPerPage = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1280) return 9;
      if (window.innerWidth >= 768) return 6;
      return 6;
    }
    return 9;
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
  
  // Categorías de accesorios
  const categories = [
    { value: 'Funda', label: 'Fundas', icon: Shield },
    { value: 'Vidrio Templado', label: 'Vidrios Templados', icon: Shield },
    { value: 'Cargador', label: 'Cargadores', icon: Battery },
    { value: 'Cable', label: 'Cables', icon: Battery },
    { value: 'Audífonos', label: 'Audífonos', icon: Package },
  ];
  
  // Obtener marcas únicas de accesorios
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    allProducts.forEach(product => {
      if (product.brand) {
        brands.add(product.brand);
      }
    });
    return Array.from(brands).sort();
  }, [allProducts]);
  
  // Obtener rango de precios
  const priceRange = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 5000 };
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
    setCurrentPage(1);
  }, [products, itemsPerPage]);
  
  useEffect(() => {
    fetchAccessories();
  }, []);
  
  useEffect(() => {
    filterProducts();
  }, [filters, allProducts]);
  
  const fetchAccessories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('type', 'accesorio')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setAllProducts(data);
      setProducts(data);
    }
    setLoading(false);
  };
  
  const filterProducts = () => {
    let filtered = [...allProducts];
    
    // Filtrar por categoría (basado en el nombre)
    if (filters.category.length > 0) {
      filtered = filtered.filter(product => {
        return filters.category.some(cat => 
          product.name.toLowerCase().includes(cat.toLowerCase())
        );
      });
    }
    
    // Filtrar por marca
    if (filters.brand.length > 0) {
      filtered = filtered.filter(product => 
        filters.brand.includes(product.brand)
      );
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
      category: [],
      brand: [],
      minPrice: '',
      maxPrice: '',
    });
  };
  
  const toggleCategory = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category.includes(category)
        ? prev.category.filter(c => c !== category)
        : [...prev.category, category]
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
  
  const activeFiltersCount = filters.category.length + filters.brand.length + 
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0A2B4E] to-[#1E4A76] rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-[#0A2B4E]">Accesorios</h1>
                <p className="text-gray-500 mt-1">
                  Protege y complementa tu equipo con nuestros accesorios
                </p>
              </div>
            </div>
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
              <div className="lg:hidden flex justify-between items-center p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Filtro por Categoría */}
                <div className="border-b border-gray-100 pb-4">
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex justify-between items-center w-full text-left mb-3"
                  >
                    <h4 className="font-semibold text-gray-900">Categoría</h4>
                    <ChevronDown size={18} className={`transform transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedSections.category && (
                    <div className="space-y-2">
                      {categories.map((cat) => (
                        <label key={cat.value} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="checkbox"
                            checked={filters.category.includes(cat.value)}
                            onChange={() => toggleCategory(cat.value)}
                            className="w-4 h-4 rounded border-gray-300 text-[#0A2B4E] focus:ring-[#0A2B4E]"
                          />
                          <cat.icon className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700">{cat.label}</span>
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
                    <h4 className="font-semibold text-gray-900">Marcas</h4>
                    <ChevronDown size={18} className={`transform transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {expandedSections.brand && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {availableBrands.map((brand) => (
                        <label key={brand} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
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
                  Ver resultados ({products.length})
                </button>
              </div>
            </div>
          </div>
          
          {/* Lista de accesorios usando AccessoryCard */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-[#0A2B4E] mx-auto" />
                <p className="text-gray-500 mt-4">Cargando accesorios...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <Package className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No se encontraron accesorios</p>
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
                {activeFiltersCount > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filters.category.map(cat => {
                      const catLabel = categories.find(c => c.value === cat)?.label;
                      return (
                        <span key={cat} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {catLabel}
                          <button onClick={() => toggleCategory(cat)} className="ml-1 hover:text-blue-900">
                            <X size={14} />
                          </button>
                        </span>
                      );
                    })}
                    {filters.brand.map(brand => (
                      <span key={brand} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        {brand}
                        <button onClick={() => toggleBrand(brand)} className="ml-1 hover:text-gray-900">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {(filters.minPrice || filters.maxPrice) && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        ${filters.minPrice || '0'} - ${filters.maxPrice || priceRange.max}
                        <button onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })} className="ml-1 hover:text-gray-900">
                          <X size={14} />
                        </button>
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-500">
                    Mostrando {paginatedProducts.length} de {products.length} accesorio{products.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-500">
                    Página {currentPage} de {totalPages}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => (
                    <AccessoryCard key={product.id} accessory={product} />
                  ))}
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    
                    <div className="flex gap-1">
                      {getPageNumbers().map((page) => (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-200 ${
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