import { createClient } from '@/lib/supabase/server';
import { 
  Smartphone, 
  Wrench, 
  Calendar, 
  Users,
  TrendingUp,
  DollarSign,
  Star,
  Activity
} from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Obtener estadísticas
  const { count: productsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });
  
  const { count: servicesCount } = await supabase
    .from('repair_services')
    .select('*', { count: 'exact', head: true });
  
  const { count: bookingsCount } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true });
  
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const stats = [
    {
      title: 'Productos',
      value: productsCount || 0,
      icon: Smartphone,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Servicios',
      value: servicesCount || 0,
      icon: Wrench,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Reservas',
      value: bookingsCount || 0,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+23%',
      changeType: 'positive'
    },
    {
      title: 'Usuarios',
      value: usersCount || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'positive'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-500">{stat.change}</span>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <a
            href="/admin/productos/nuevo"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Smartphone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Agregar producto</p>
              <p className="text-sm text-gray-500">Nuevo, usado o reacondicionado</p>
            </div>
          </a>
          <a
            href="/admin/servicios/nuevo"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Wrench className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Agregar servicio</p>
              <p className="text-sm text-gray-500">Nuevo tipo de reparación</p>
            </div>
          </a>
          <a
            href="/admin/reservas"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Calendar className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Ver reservas</p>
              <p className="text-sm text-gray-500">Gestionar solicitudes</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}