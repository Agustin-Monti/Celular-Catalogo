import { ProductForm } from '@/components/admin/products/ProductForm';

export default function NuevoProductoPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo producto</h1>
        <p className="text-gray-500 mt-1">Agrega un nuevo celular al catálogo</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ProductForm />
      </div>
    </div>
  );
}