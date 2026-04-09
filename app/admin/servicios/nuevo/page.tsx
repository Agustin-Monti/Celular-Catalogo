import { ServiceForm } from '@/components/admin/servicios/ServiceForm';

export default function NuevoServicioPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nuevo servicio</h1>
        <p className="text-gray-500 mt-1">Agrega un nuevo servicio de reparación</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <ServiceForm />
      </div>
    </div>
  );
}