import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ServiceForm } from '@/components/admin/servicios/ServiceForm';
import { RepairService } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarServicioPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  
  const { data: service, error } = await supabase
    .from('repair_services')
    .select('*')
    .eq('id', id)
    .single<RepairService>();
  
  if (error || !service) {
    notFound();
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Editar servicio</h1>
        <p className="text-gray-500 mt-1">Modifica la información del servicio</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ServiceForm service={service} isEditing />
      </div>
    </div>
  );
}