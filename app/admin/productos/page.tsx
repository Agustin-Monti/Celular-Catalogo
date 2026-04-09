'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product } from '@/types';
import Link from 'next/link';
import { AdminImage } from '@/components/ui/AdminImage';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Star,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export default function ProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModal, setDeleteModal] = useState<{ 
    show: boolean; 
    product: Product | null;
    deleting: boolean;
  }>({
    show: false,
    product: null,
    deleting: false,
  });
  
  const itemsPerPage = 10;
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    
    let query = supabase
      .from('products')
      .select('*', { count: 'exact' });

    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%`);
    }

    const from = (currentPage - 1) * itemsPerPage;
    const to = from + itemsPerPage - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && data) {
      setProducts(data);
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));
    }
    setLoading(false);
  };

  // Función para extraer la ruta de la carpeta desde la URL
  const extractFolderPath = (imageUrl: string): string | null => {
    try {
      // La URL tiene formato: https://.../storage/v1/object/public/celu-reparaciones/productos/{productId}/{filename}
      const match = imageUrl.match(/\/celu-reparaciones\/(productos\/[^\/]+)/);
      if (match && match[1]) {
        return match[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  // Función para eliminar todas las imágenes de un producto del bucket
  const deleteProductImagesFromBucket = async (product: Product): Promise<boolean> => {
    if (!product.images || product.images.length === 0) {
      console.log('El producto no tiene imágenes para eliminar');
      return true;
    }

    try {
      // Obtener la carpeta única del producto desde la primera imagen
      const folderPath = extractFolderPath(product.images[0]);
      if (!folderPath) {
        console.error('No se pudo determinar la carpeta del producto');
        return false;
      }

      console.log('Eliminando carpeta completa:', folderPath);

      // Listar todos los archivos en la carpeta
      const { data: files, error: listError } = await supabase.storage
        .from('celu-reparaciones')
        .list(folderPath);

      if (listError) {
        console.error('Error al listar archivos:', listError);
        return false;
      }

      if (!files || files.length === 0) {
        console.log('No hay archivos en la carpeta');
        return true;
      }

      // Crear rutas completas de los archivos a eliminar
      const filesToDelete = files.map(file => `${folderPath}/${file.name}`);
      console.log('Archivos a eliminar:', filesToDelete);

      // Eliminar todos los archivos de la carpeta
      const { error: deleteError } = await supabase.storage
        .from('celu-reparaciones')
        .remove(filesToDelete);

      if (deleteError) {
        console.error('Error al eliminar archivos:', deleteError);
        return false;
      }

      console.log('Carpeta eliminada exitosamente:', folderPath);
      return true;
    } catch (err) {
      console.error('Error en deleteProductImagesFromBucket:', err);
      return false;
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.product) return;

    setDeleteModal(prev => ({ ...prev, deleting: true }));

    try {
      // 1. Eliminar las imágenes del bucket
      console.log('Eliminando imágenes del producto:', deleteModal.product.name);
      const imagesDeleted = await deleteProductImagesFromBucket(deleteModal.product);
      
      if (!imagesDeleted) {
        console.warn('Advertencia: No se pudieron eliminar todas las imágenes del bucket');
        // Continuamos con la eliminación del producto de todas formas
      }

      // 2. Eliminar el producto de la base de datos
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .eq('id', deleteModal.product.id);

      if (deleteError) throw deleteError;

      console.log('Producto eliminado exitosamente');
      
      // 3. Recargar la lista
      fetchProducts();
      setDeleteModal({ show: false, product: null, deleting: false });
      
    } catch (err: any) {
      console.error('Error al eliminar producto:', err);
      alert('Error al eliminar el producto: ' + err.message);
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

  const getTypeBadge = (type: string) => {
    const styles = {
      nuevo: 'bg-green-100 text-green-800',
      usado: 'bg-yellow-100 text-yellow-800',
      reparacion: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      nuevo: 'Nuevo',
      usado: 'Usado',
      reparacion: 'Reacondicionado',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[type as keyof typeof styles] || 'bg-gray-100'}`}>
        {labels[type as keyof typeof labels] || type}
      </span>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-gray-500 mt-1">Gestiona el catálogo de celulares</p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-[#0A2B4E] text-white px-4 py-2 rounded-lg hover:bg-[#1E4A76] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo producto
        </Link>
      </div>

      {/* Búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre, marca o modelo..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabla de productos */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A2B4E] mx-auto"></div>
          <p className="text-gray-500 mt-4">Cargando productos...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No hay productos registrados</p>
          <Link
            href="/admin/productos/nuevo"
            className="inline-block mt-4 text-[#0A2B4E] hover:underline"
          >
            Crear el primer producto
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
                      Producto
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marca / Modelo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Destacado
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <AdminImage 
                            src={product.images?.[0] || ''} 
                            alt={product.name}
                            size="md"
                          />
                          <span className="font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{product.brand}</p>
                          <p className="text-xs text-gray-500">{product.model}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getTypeBadge(product.type)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          ${product.price.toLocaleString()}
                        </span>
                        {product.original_price && (
                          <span className="text-xs text-gray-400 line-through ml-1">
                            ${product.original_price.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? product.stock : 'Agotado'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {product.is_featured && (
                          <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/producto/${product.id}`}
                            target="_blank"
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/admin/productos/editar/${product.id}`}
                            className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => setDeleteModal({ show: true, product, deleting: false })}
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
      {deleteModal.show && deleteModal.product && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Confirmar eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar el producto <strong className="text-gray-900">{deleteModal.product.name}</strong>?
            </p>
            <p className="text-gray-500 text-sm mb-4">
              Esta acción eliminará permanentemente el producto de la base de datos y 
              <strong className="text-red-600"> todas sus imágenes del almacenamiento</strong>. No se puede deshacer.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6">
              <p className="text-xs text-yellow-800">
                ⚠️ Se eliminarán {deleteModal.product.images?.length || 0} imagen(es) de la carpeta del producto.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal({ show: false, product: null, deleting: false })}
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
                    Eliminar permanentemente
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