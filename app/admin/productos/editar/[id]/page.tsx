import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/products/ProductForm';
import { Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarProductoPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single<Product>();
  
  if (error || !product) {
    notFound();
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar producto</h1>
        <p className="text-gray-500 mt-1">Modifica la información del producto</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ProductForm product={product} isEditing />
      </div>
    </div>
  );
}