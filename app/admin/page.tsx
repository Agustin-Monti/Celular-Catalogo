import { createClient } from '@/lib/supabase/server';
import { 
  Smartphone, 
  Wrench, 
  Calendar, 
  Users,
  TrendingUp,
  TrendingDown,
  Star,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

// Definir tipos para mejor seguridad
interface BookingWithDetails {
  id: string;
  customer_name: string;
  service_type: string;
  status: string;
  created_at: string;
  product: { name: string } | null;
  repair_service: { device_type: string; issue_type: string } | null;
}

interface TopProduct {
  product_id: string;
  products: { name: string } | null;
  count: number;
}

interface TopService {
  repair_service_id: string;
  repair_services: { device_type: string; issue_type: string } | null;
  count: number;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  
  // Obtener fechas para comparativas
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  
  // 1. ESTADÍSTICAS GENERALES
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
  
  // 2. RESERVAS POR ESTADO
  const { data: bookingsByStatus } = await supabase
    .from('bookings')
    .select('status');
  
  const pendingBookings = bookingsByStatus?.filter(b => b.status === 'pendiente').length || 0;
  const confirmedBookings = bookingsByStatus?.filter(b => b.status === 'confirmada').length || 0;
  const completedBookings = bookingsByStatus?.filter(b => b.status === 'completada').length || 0;
  const cancelledBookings = bookingsByStatus?.filter(b => b.status === 'cancelada').length || 0;
  
  // 3. RESERVAS DEL MES ACTUAL VS MES ANTERIOR
  const { count: thisMonthBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayThisMonth.toISOString());
  
  const { count: lastMonthBookings } = await supabase
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', firstDayLastMonth.toISOString())
    .lte('created_at', lastDayLastMonth.toISOString());
  
  const currentMonthCount = thisMonthBookings ?? 0;
  const lastMonthCount = lastMonthBookings ?? 0;
  const bookingsGrowth = lastMonthCount > 0 
    ? ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100 
    : 0;
  
  // 4. PRODUCTOS MÁS SOLICITADOS
  const { data: productBookings } = await supabase
    .from('bookings')
    .select('product_id, products(name)')
    .eq('service_type', 'compra')
    .not('product_id', 'is', null)
    .limit(20);

  // Contar productos más solicitados - Versión corregida
  const productCountMap = new Map<string, { name: string; count: number }>();

  if (productBookings && productBookings.length > 0) {
    productBookings.forEach((booking: any) => {
      if (booking.product_id && booking.products) {
        // Manejar diferentes formatos que puede devolver Supabase
        let productName: string | null = null;
        
        if (Array.isArray(booking.products) && booking.products.length > 0) {
          // Si es un array, tomar el primer elemento
          const firstProduct = booking.products[0];
          productName = firstProduct?.name || null;
        } else if (booking.products && typeof booking.products === 'object') {
          // Si es un objeto directo
          productName = booking.products.name || null;
        }
        
        if (productName) {
          const existing = productCountMap.get(booking.product_id);
          if (existing) {
            existing.count++;
          } else {
            productCountMap.set(booking.product_id, { name: productName, count: 1 });
          }
        }
      }
    });
  }

  const topProductsList = Array.from(productCountMap.entries())
    .map(([id, data]) => ({ id, name: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // 5. SERVICIOS MÁS SOLICITADOS
  const { data: serviceBookings } = await supabase
    .from('bookings')
    .select('repair_service_id, repair_services(device_type, issue_type)')
    .eq('service_type', 'reparacion')
    .not('repair_service_id', 'is', null)
    .limit(20);
  
  // Contar servicios más solicitados
  const serviceCountMap = new Map<string, { device_type: string; issue_type: string; count: number }>();
  serviceBookings?.forEach(booking => {
    if (booking.repair_service_id && booking.repair_services) {
      const serviceData = Array.isArray(booking.repair_services) 
        ? booking.repair_services[0] 
        : booking.repair_services;
      if (serviceData?.device_type) {
        const existing = serviceCountMap.get(booking.repair_service_id);
        if (existing) {
          existing.count++;
        } else {
          serviceCountMap.set(booking.repair_service_id, { 
            device_type: serviceData.device_type, 
            issue_type: serviceData.issue_type || '',
            count: 1 
          });
        }
      }
    }
  });
  
  const topServicesList = Array.from(serviceCountMap.entries())
    .map(([id, data]) => ({ id, device_type: data.device_type, issue_type: data.issue_type, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  
  // 6. ACTIVIDAD RECIENTE (últimas 5 reservas)
  const { data: recentBookingsRaw } = await supabase
    .from('bookings')
    .select(`
      id,
      customer_name,
      service_type,
      status,
      created_at,
      product:product_id (name),
      repair_service:repair_service_id (device_type, issue_type)
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  
  // Tipar correctamente los datos de actividad reciente
  const recentBookings: BookingWithDetails[] = (recentBookingsRaw || []).map(booking => ({
    id: booking.id,
    customer_name: booking.customer_name,
    service_type: booking.service_type,
    status: booking.status,
    created_at: booking.created_at,
    product: booking.product ? (Array.isArray(booking.product) ? booking.product[0] : booking.product) : null,
    repair_service: booking.repair_service ? (Array.isArray(booking.repair_service) ? booking.repair_service[0] : booking.repair_service) : null
  }));
  
  // 7. PRODUCTOS CON BAJO STOCK
  const { data: lowStockProducts } = await supabase
    .from('products')
    .select('id, name, brand, stock')
    .lt('stock', 5)
    .order('stock', { ascending: true })
    .limit(5);
  
  // Estadísticas para las tarjetas principales
  const stats = [
    {
      title: 'Productos',
      value: productsCount ?? 0,
      icon: Smartphone,
      color: 'bg-blue-500',
      link: '/admin/productos'
    },
    {
      title: 'Servicios',
      value: servicesCount ?? 0,
      icon: Wrench,
      color: 'bg-green-500',
      link: '/admin/servicios'
    },
    {
      title: 'Reservas',
      value: bookingsCount ?? 0,
      icon: Calendar,
      color: 'bg-yellow-500',
      link: '/admin/reservas'
    },
    {
      title: 'Usuarios',
      value: usersCount ?? 0,
      icon: Users,
      color: 'bg-purple-500',
      link: '#'
    },
  ];
  
  const statusCards = [
    {
      title: 'Pendientes',
      value: pendingBookings,
      icon: Clock,
      color: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Confirmadas',
      value: confirmedBookings,
      icon: CheckCircle,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Completadas',
      value: completedBookings,
      icon: Star,
      color: 'bg-green-100',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    {
      title: 'Canceladas',
      value: cancelledBookings,
      icon: XCircle,
      color: 'bg-red-100',
      textColor: 'text-red-700',
      borderColor: 'border-red-200'
    },
  ];
  
  const totalBookings = bookingsCount ?? 1;
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido al panel de administración</p>
      </div>
      
      {/* Stats grid principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.title}
            href={stat.link}
            className="block bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
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
              <div className={`flex items-center gap-1 ${bookingsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {bookingsGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm font-medium">
                  {Math.abs(bookingsGrowth).toFixed(1)}%
                </span>
              </div>
              <span className="text-xs text-gray-500">vs mes anterior</span>
            </div>
          </Link>
        ))}
      </div>
      
      {/* Tarjetas de estado de reservas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statusCards.map((card) => (
          <div
            key={card.title}
            className={`bg-white rounded-xl border ${card.borderColor} p-4 hover:shadow-md transition-all duration-300`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`${card.color} p-2 rounded-lg`}>
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
              <div className={`text-xs ${card.textColor} font-medium`}>
                {totalBookings > 0 ? `${Math.round((card.value / totalBookings) * 100)}%` : '0%'}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Sección de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Productos más solicitados */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Productos más solicitados</h2>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          {topProductsList.length > 0 ? (
            <div className="space-y-3">
              {topProductsList.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.count} solicitudes</p>
                    </div>
                  </div>
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(product.count / (topProductsList[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos suficientes</p>
          )}
        </div>
        
        {/* Servicios más solicitados */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Servicios más solicitados</h2>
            <Wrench className="w-5 h-5 text-gray-400" />
          </div>
          {topServicesList.length > 0 ? (
            <div className="space-y-3">
              {topServicesList.map((service, index) => (
                <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                    <div>
                      <p className="font-medium text-gray-900">{service.device_type}</p>
                      <p className="text-xs text-gray-500">{service.issue_type} - {service.count} solicitudes</p>
                    </div>
                  </div>
                  <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${(service.count / (topServicesList[0]?.count || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No hay datos suficientes</p>
          )}
        </div>
      </div>
      
      {/* Sección de actividad reciente y stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Actividad reciente */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Actividad reciente</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    {booking.service_type === 'compra' ? (
                      <ShoppingCart className="w-4 h-4 text-blue-500" />
                    ) : (
                      <Wrench className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {booking.customer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {booking.service_type === 'compra' 
                        ? `Consultó por: ${booking.product?.name || 'Producto'}`
                        : `Solicitó reparación: ${booking.repair_service?.device_type || 'Servicio'}`
                      }
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(booking.created_at).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    booking.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                    booking.status === 'confirmada' ? 'bg-blue-100 text-blue-700' :
                    booking.status === 'completada' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {booking.status === 'pendiente' ? 'Pendiente' :
                     booking.status === 'confirmada' ? 'Confirmada' :
                     booking.status === 'completada' ? 'Completada' : 'Cancelada'}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No hay actividad reciente</p>
            )}
          </div>
          <div className="mt-4 text-center">
            <Link 
              href="/admin/reservas"
              className="text-sm text-[#0A2B4E] hover:text-[#1E4A76] font-medium"
            >
              Ver todas las reservas →
            </Link>
          </div>
        </div>
        
        {/* Stock bajo */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Productos con stock bajo</h2>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      Stock: {product.stock}
                    </p>
                    {product.stock === 0 && (
                      <p className="text-xs text-red-500">¡Agotado!</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-gray-500">¡Todos los productos tienen stock suficiente!</p>
            </div>
          )}
          <div className="mt-4 text-center">
            <Link 
              href="/admin/productos"
              className="text-sm text-[#0A2B4E] hover:text-[#1E4A76] font-medium"
            >
              Gestionar inventario →
            </Link>
          </div>
        </div>
      </div>
      
      {/* Quick actions */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/productos/nuevo"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Smartphone className="w-5 h-5 text-blue-500" />
            <div>
              <p className="font-medium text-gray-900">Agregar producto</p>
              <p className="text-sm text-gray-500">Nuevo, usado o reacondicionado</p>
            </div>
          </Link>
          <Link
            href="/admin/servicios/nuevo"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Wrench className="w-5 h-5 text-green-500" />
            <div>
              <p className="font-medium text-gray-900">Agregar servicio</p>
              <p className="text-sm text-gray-500">Nuevo tipo de reparación</p>
            </div>
          </Link>
          <Link
            href="/admin/reservas"
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Calendar className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Ver reservas</p>
              <p className="text-sm text-gray-500">Gestionar solicitudes</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
