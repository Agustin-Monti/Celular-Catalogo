'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Product, ProductType } from '@/types';
import { 
  Save, 
  X, 
  Upload, 
  Trash2, 
  Plus,
  Smartphone,
  HardDrive,
  Cpu,
  Camera,
  Battery,
  Loader2,
  AlertCircle,
  Package,
  Palette,
  Ruler,
  Plug,
  Cable,
  Zap,
  Shield,
  Microscope
} from 'lucide-react';
import Image from 'next/image';

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

interface ImageFile {
  file: File | null;
  preview: string;
  uploading: boolean;
  url?: string;
  isExisting?: boolean;
  toDelete?: boolean;
}

// Interfaz para specs de celular
interface PhoneSpecs {
  storage: string;
  ram: string;
  camera: string;
  battery: string;
  screen: string;
}

// Interfaz para specs de accesorio
interface AccessorySpecs {
  compatible: string;
  material: string;
  color: string;
  conector: string;
  potencia: string;
  longitud: string;
  puerto: string;
  carga: string;
  incluye: string;
  garantia: string;
}

// Tipo combinado
type ProductSpecs = PhoneSpecs & Partial<AccessorySpecs>;

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const [productType, setProductType] = useState<ProductType>(product?.type || 'nuevo');
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    model: product?.model || '',
    type: product?.type || 'nuevo' as ProductType,
    price: product?.price || 0,
    original_price: product?.original_price || '',
    condition: product?.condition || '',
    stock: product?.stock || 1,
    is_featured: product?.is_featured || false,
    description: product?.description || '',
    specs: {
      // Campos para celulares
      storage: product?.specs?.storage || '',
      ram: product?.specs?.ram || '',
      camera: product?.specs?.camera || '',
      battery: product?.specs?.battery || '',
      screen: product?.specs?.screen || '',
      // Campos para accesorios
      compatible: product?.specs?.compatible || '',
      material: product?.specs?.material || '',
      color: product?.specs?.color || '',
      conector: product?.specs?.conector || '',
      potencia: product?.specs?.potencia || '',
      longitud: product?.specs?.longitud || '',
      puerto: product?.specs?.puerto || '',
      carga: product?.specs?.carga || '',
      incluye: product?.specs?.incluye || '',
      garantia: product?.specs?.garantia || '',
    },
  });

  // Si estamos editando, cargar las imágenes existentes
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setImageFiles(product.images.map(url => ({
        file: null,
        preview: url,
        uploading: false,
        url: url,
        isExisting: true,
        toDelete: false
      })));
    }
  }, [product]);

  // Extraer la ruta del archivo desde la URL pública
  const extractFilePath = (publicUrl: string): string | null => {
    try {
      const urlParts = publicUrl.split('/celu-reparaciones/');
      if (urlParts.length > 1) {
        return urlParts[1];
      }
      return null;
    } catch {
      return null;
    }
  };

  // Eliminar imagen del bucket
  const deleteImageFromBucket = async (imageUrl: string): Promise<boolean> => {
    try {
      const filePath = extractFilePath(imageUrl);
      if (!filePath) {
        console.error('No se pudo extraer la ruta del archivo:', imageUrl);
        return false;
      }

      console.log('Eliminando imagen del bucket:', filePath);
      
      const { error: deleteError } = await supabase.storage
        .from('celu-reparaciones')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error al eliminar imagen del bucket:', deleteError);
        return false;
      }

      console.log('Imagen eliminada exitosamente:', filePath);
      return true;
    } catch (err) {
      console.error('Error en deleteImageFromBucket:', err);
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name.includes('specs.')) {
      const specKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        specs: { ...prev.specs, [specKey]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as ProductType;
    setProductType(newType);
    setFormData(prev => ({ ...prev, type: newType }));
  };

  const handleImagesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages: ImageFile[] = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      uploading: false,
      isExisting: false,
      toDelete: false
    }));
    setImageFiles(prev => [...prev, ...newImages]);
  };

  const removeImage = async (index: number) => {
    const imageToRemove = imageFiles[index];
    
    if (imageToRemove.isExisting && imageToRemove.url) {
      const deleted = await deleteImageFromBucket(imageToRemove.url);
      if (deleted) {
        setDeletedImages(prev => [...prev, imageToRemove.url!]);
      }
    }
    
    if (imageToRemove.preview && !imageToRemove.url && !imageToRemove.isExisting) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    const newImages = [...imageFiles];
    newImages.splice(index, 1);
    setImageFiles(newImages);
  };

  const uploadImages = async (productId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const newImages = imageFiles.filter(img => !img.url && !img.isExisting && img.file);
    
    for (const image of newImages) {
      const index = imageFiles.findIndex(img => img === image);
      if (index !== -1) {
        imageFiles[index].uploading = true;
        setImageFiles([...imageFiles]);
      }
      
      try {
        const timestamp = Date.now();
        const randomId = Math.random().toString(36).substring(7);
        const fileExt = image.file!.name.split('.').pop()?.toLowerCase() || 'webp';
        const fileName = `${timestamp}-${randomId}.${fileExt}`;
        const filePath = `productos/${productId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('celu-reparaciones')
          .upload(filePath, image.file!, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('celu-reparaciones')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        
        if (index !== -1) {
          imageFiles[index].url = publicUrl;
          imageFiles[index].uploading = false;
          setImageFiles([...imageFiles]);
        }
        
      } catch (err: any) {
        console.error('Error en uploadImages:', err);
        if (index !== -1) {
          imageFiles[index].uploading = false;
          setImageFiles([...imageFiles]);
        }
        throw err;
      }
    }
    
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (imageFiles.length === 0 && !isEditing) {
        setError('Debes subir al menos una imagen del producto');
        setLoading(false);
        return;
      }

      // Crear objeto de especificaciones según el tipo de producto
      let productSpecs: any = {};
      
      if (productType === 'accesorio') {
        // Para accesorios, solo incluir campos de accesorio
        productSpecs = {
          compatible: formData.specs.compatible || null,
          material: formData.specs.material || null,
          color: formData.specs.color || null,
          conector: formData.specs.conector || null,
          potencia: formData.specs.potencia || null,
          longitud: formData.specs.longitud || null,
          puerto: formData.specs.puerto || null,
          carga: formData.specs.carga || null,
          incluye: formData.specs.incluye || null,
          garantia: formData.specs.garantia || null,
        };
      } else {
        // Para celulares, solo incluir campos de celular
        productSpecs = {
          storage: formData.specs.storage || null,
          ram: formData.specs.ram || null,
          camera: formData.specs.camera || null,
          battery: formData.specs.battery || null,
          screen: formData.specs.screen || null,
        };
      }

      const productData = {
        name: formData.name,
        brand: formData.brand,
        model: formData.model,
        type: productType,
        price: formData.price,
        original_price: formData.original_price ? parseFloat(formData.original_price as string) : null,
        condition: formData.condition || null,
        stock: formData.stock,
        is_featured: formData.is_featured,
        description: formData.description || null,
        specs: productSpecs,
      };

      let productId: string;
      
      if (isEditing && product) {
        productId = product.id;
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId);
        
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        
        if (insertError) throw insertError;
        productId = data.id;
      }

      const uploadedUrls = await uploadImages(productId);
      
      const remainingUrls = imageFiles
        .filter(img => img.isExisting && img.url && !deletedImages.includes(img.url))
        .map(img => img.url as string);
      
      const allImages = [...remainingUrls, ...uploadedUrls];
      
      const { error: updateImagesError } = await supabase
        .from('products')
        .update({ images: allImages })
        .eq('id', productId);
      
      if (updateImagesError) throw updateImagesError;

      router.push('/admin/productos');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setLoading(false);
    }
  };

  const isAccessory = productType === 'accesorio';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Información básica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca *
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                placeholder={isAccessory ? "Opcional" : "Modelo del celular"}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                name="type"
                value={productType}
                onChange={handleTypeChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              >
                <option value="nuevo">Nuevo</option>
                <option value="usado">Usado</option>
                <option value="reparacion">Reacondicionado</option>
                <option value="accesorio">Accesorio</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condición
              </label>
              <input
                type="text"
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                placeholder={isAccessory ? "Ej: Nuevo, Original" : "Ej: Excelente - 95% batería"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio original
              </label>
              <input
                type="number"
                name="original_price"
                value={formData.original_price}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-[#0A2B4E] focus:ring-[#0A2B4E]"
                />
                <span className="text-sm text-gray-700">Producto destacado</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
            />
          </div>
        </div>

        {/* Especificaciones dinámicas */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              {isAccessory ? <Package className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
              {isAccessory ? 'Especificaciones del accesorio' : 'Especificaciones técnicas'}
            </h3>
            
            {!isAccessory ? (
              // Campos para celulares
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.storage"
                    value={formData.specs.storage}
                    onChange={handleChange}
                    placeholder="Almacenamiento (Ej: 128GB)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.ram"
                    value={formData.specs.ram}
                    onChange={handleChange}
                    placeholder="RAM (Ej: 6GB)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.camera"
                    value={formData.specs.camera}
                    onChange={handleChange}
                    placeholder="Cámara (Ej: 48MP + 12MP)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Battery className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.battery"
                    value={formData.specs.battery}
                    onChange={handleChange}
                    placeholder="Batería (Ej: 4000mAh)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.screen"
                    value={formData.specs.screen}
                    onChange={handleChange}
                    placeholder="Pantalla (Ej: 6.7 pulgadas)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
              </div>
            ) : (
              // Campos para accesorios
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.compatible"
                    value={formData.specs.compatible}
                    onChange={handleChange}
                    placeholder="Compatible con (Ej: iPhone 15 Pro Max)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.material"
                    value={formData.specs.material}
                    onChange={handleChange}
                    placeholder="Material (Ej: Silicona, Vidrio templado)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.color"
                    value={formData.specs.color}
                    onChange={handleChange}
                    placeholder="Color (Ej: Negro, Blanco)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Plug className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.conector"
                    value={formData.specs.conector}
                    onChange={handleChange}
                    placeholder="Conector (Ej: USB-C, Lightning)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.potencia"
                    value={formData.specs.potencia}
                    onChange={handleChange}
                    placeholder="Potencia (Ej: 20W, 15W)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Ruler className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.longitud"
                    value={formData.specs.longitud}
                    onChange={handleChange}
                    placeholder="Longitud (Ej: 1m, 2m)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Cable className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.puerto"
                    value={formData.specs.puerto}
                    onChange={handleChange}
                    placeholder="Puerto (Ej: USB-A, USB-C)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.carga"
                    value={formData.specs.carga}
                    onChange={handleChange}
                    placeholder="Tipo de carga (Ej: Rápida, Inalámbrica)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.incluye"
                    value={formData.specs.incluye}
                    onChange={handleChange}
                    placeholder="Incluye (Ej: 2 unidades, Cable incluido)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Microscope className="w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="specs.garantia"
                    value={formData.specs.garantia}
                    onChange={handleChange}
                    placeholder="Garantía (Ej: 6 meses, 1 año)"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Imágenes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Imágenes del producto</h3>
            
            <div className="grid grid-cols-3 gap-3 mb-4">
              {imageFiles.map((img, idx) => (
                <div key={idx} className="relative group">
                  <div className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={img.preview}
                      alt={`Preview ${idx + 1}`}
                      fill
                      className="object-contain p-2"
                      sizes="128px"
                    />
                    {img.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={img.uploading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {img.isExisting && (
                    <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                      Guardada
                    </div>
                  )}
                </div>
              ))}
              
              <label className="relative h-32 w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#0A2B4E] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImagesSelect}
                  className="hidden"
                />
                <Plus className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Agregar imagen</span>
              </label>
            </div>
            
            <p className="text-xs text-gray-500">
              * Las imágenes eliminadas se borrarán permanentemente del almacenamiento
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-[#0A2B4E] text-white rounded-lg hover:bg-[#1E4A76] transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Guardando...' : isEditing ? 'Actualizar producto' : 'Crear producto'}
        </button>
      </div>
    </form>
  );
}