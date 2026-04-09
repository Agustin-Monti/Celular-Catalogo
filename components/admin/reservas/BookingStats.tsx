'use client';

import { Calendar, CheckCircle, Clock, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

interface BookingStatsProps {
  stats: {
    total: number;
    pendiente: number;
    confirmada: number;
    en_proceso: number;
    completada: number;
    cancelada: number;
    thisMonth: number;
    lastMonth: number;
  };
}

export function BookingStats({ stats }: BookingStatsProps) {
  const statsCards = [
    {
      title: 'Total reservas',
      value: stats.total,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Pendientes',
      value: stats.pendiente,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '+5%',
      changeType: 'positive'
    },
    {
      title: 'Confirmadas',
      value: stats.confirmada,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Canceladas',
      value: stats.cancelada,
      icon: XCircle,
      color: 'bg-red-500',
      change: '-3%',
      changeType: 'negative'
    },
  ];

  const monthChange = stats.thisMonth - stats.lastMonth;
  const monthChangePercent = stats.lastMonth > 0 
    ? ((monthChange / stats.lastMonth) * 100).toFixed(1) 
    : '0';

  return (
    <div className="space-y-6">
      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.changeType === 'positive' ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Tarjeta de resumen mensual */}
      <div className="bg-gradient-to-r from-[#0A2B4E] to-[#1E4A76] rounded-xl p-5 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold">Resumen del mes</h3>
            <p className="text-sm text-gray-300 mt-1">Comparación con el mes anterior</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.thisMonth}</p>
              <p className="text-xs text-gray-300">Este mes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.lastMonth}</p>
              <p className="text-xs text-gray-300">Mes anterior</p>
            </div>
            <div className={`text-center px-3 py-1 rounded-lg ${
              monthChange >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'
            }`}>
              <p className={`text-lg font-bold ${monthChange >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                {monthChange >= 0 ? '+' : ''}{monthChange}
              </p>
              <p className="text-xs text-gray-300">{monthChangePercent}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}