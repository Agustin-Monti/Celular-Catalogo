'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { RepairService } from '@/types';
import { IconSelect } from '@/components/ui/IconSelect';
import { 
  Save, 
  Wrench,
  Clock,
  Shield,
  Smartphone,
  Battery,
  Droplet,
  Volume2,
  Camera,
  HardDrive,
  Zap,
  AlertCircle,
  Loader2,
  Settings
} from 'lucide-react';

interface ServiceFormProps {
  service?: RepairService;
  isEditing?: boolean;
}

interface Option {
  value: string;
  label: string;
  icon: React.ReactNode;
}

// Opciones de dispositivos con iconos
const deviceOptions: Option[] = [
  { value: 'iPhone', label: 'iPhone', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Samsung', label: 'Samsung', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Xiaomi', label: 'Xiaomi', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Motorola', label: 'Motorola', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Google Pixel', label: 'Google Pixel', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Huawei', label: 'Huawei', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Otros Android', label: 'Otros Android', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Todos los modelos', label: 'Todos los modelos', icon: <Smartphone className="w-4 h-4" /> },
];

// Opciones de problemas con iconos
const issueOptions: Option[] = [
  { value: 'Cambio de batería', label: 'Cambio de batería', icon: <Battery className="w-4 h-4" /> },
  { value: 'Cambio de pantalla', label: 'Cambio de pantalla', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Cambio de módulo de carga', label: 'Cambio de módulo de carga', icon: <Zap className="w-4 h-4" /> },
  { value: 'Reparación de cámara', label: 'Reparación de cámara', icon: <Camera className="w-4 h-4" /> },
  { value: 'Reparación de software', label: 'Reparación de software', icon: <HardDrive className="w-4 h-4" /> },
  { value: 'Reparación de placa', label: 'Reparación de placa', icon: <HardDrive className="w-4 h-4" /> },
  { value: 'Limpieza profunda', label: 'Limpieza profunda', icon: <Droplet className="w-4 h-4" /> },
  { value: 'Cambio de micrófono', label: 'Cambio de micrófono', icon: <Volume2 className="w-4 h-4" /> },
  { value: 'Lector de huellas', label: 'Lector de huellas', icon: <Smartphone className="w-4 h-4" /> },
  { value: 'Desbloqueo de iCloud', label: 'Desbloqueo de iCloud', icon: <Shield className="w-4 h-4" /> },
  { value: 'Rescate de información', label: 'Rescate de información', icon: <HardDrive className="w-4 h-4" /> },
  { value: 'Diagnóstico completo', label: 'Diagnóstico completo', icon: <Wrench className="w-4 h-4" /> },
  { value: 'Impermeabilización', label: 'Impermeabilización', icon: <Droplet className="w-4 h-4" /> },
  { value: 'Cambio de vidrio templado', label: 'Cambio de vidrio templado', icon: <Smartphone className="w-4 h-4" /> },
];

// Opciones de tiempo estimado
const timeOptions: Option[] = [
  { value: '15 minutos', label: '15 minutos', icon: <Clock className="w-4 h-4" /> },
  { value: '30 minutos', label: '30 minutos', icon: <Clock className="w-4 h-4" /> },
  { value: '1 hora', label: '1 hora', icon: <Clock className="w-4 h-4" /> },
  { value: '1-2 horas', label: '1-2 horas', icon: <Clock className="w-4 h-4" /> },
  { value: '2-3 horas', label: '2-3 horas', icon: <Clock className="w-4 h-4" /> },
  { value: '3-4 horas', label: '3-4 horas', icon: <Clock className="w-4 h-4" /> },
  { value: '24 horas', label: '24 horas', icon: <Clock className="w-4 h-4" /> },
  { value: '24-48 horas', label: '24-48 horas', icon: <Clock className="w-4 h-4" /> },
];

// Opciones de garantía
const warrantyOptions: Option[] = [
  { value: '0', label: 'Sin garantía', icon: <Shield className="w-4 h-4" /> },
  { value: '30', label: '30 días', icon: <Shield className="w-4 h-4" /> },
  { value: '60', label: '60 días', icon: <Shield className="w-4 h-4" /> },
  { value: '90', label: '90 días', icon: <Shield className="w-4 h-4" /> },
  { value: '180', label: '180 días (6 meses)', icon: <Shield className="w-4 h-4" /> },
  { value: '365', label: '365 días (1 año)', icon: <Shield className="w-4 h-4" /> },
];

export function ServiceForm({ service, isEditing = false }: ServiceFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customIssue, setCustomIssue] = useState(false);
  const [customIssueText, setCustomIssueText] = useState('');
  
  const [formData, setFormData] = useState({
    device_type: service?.device_type || '',
    issue_type: service?.issue_type || '',
    price: service?.price || 0,
    estimated_time: service?.estimated_time || '',
    warranty_days: service?.warranty_days || 30,
    is_available: service?.is_available !== undefined ? service.is_available : true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const finalIssueType = customIssue ? customIssueText : formData.issue_type;
      
      if (!finalIssueType) {
        setError('Debes seleccionar o escribir un tipo de problema');
        setLoading(false);
        return;
      }

      const serviceData = {
        device_type: formData.device_type,
        issue_type: finalIssueType,
        price: formData.price,
        estimated_time: formData.estimated_time,
        warranty_days: formData.warranty_days,
        is_available: formData.is_available,
      };

      let error;
      if (isEditing && service) {
        const { error: updateError } = await supabase
          .from('repair_services')
          .update(serviceData)
          .eq('id', service.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('repair_services')
          .insert([serviceData]);
        error = insertError;
      }

      if (error) throw error;

      router.push('/admin/servicios');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving service:', err);
      setError(err.message || 'Error al guardar el servicio');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedIssueIcon = () => {
    if (customIssue) return <Settings className="w-4 h-4" />;
    const issue = issueOptions.find(i => i.value === formData.issue_type);
    return issue?.icon || <Wrench className="w-4 h-4" />;
  };

  const getDeviceIcon = (deviceType: string) => {
    const device = deviceOptions.find(d => d.value === deviceType);
    return device?.icon || <Smartphone className="w-4 h-4" />;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del servicio */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Información del servicio</h3>
          
          {/* Tipo de dispositivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de dispositivo *
            </label>
            <IconSelect
              options={deviceOptions}
              value={formData.device_type}
              onChange={(value) => setFormData(prev => ({ ...prev, device_type: value }))}
              placeholder="Selecciona un dispositivo"
              required
            />
          </div>

          {/* Tipo de problema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de problema *
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setCustomIssue(false)}
                className={`flex-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                  !customIssue
                    ? 'bg-[#0A2B4E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Seleccionar de lista
              </button>
              <button
                type="button"
                onClick={() => setCustomIssue(true)}
                className={`flex-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                  customIssue
                    ? 'bg-[#0A2B4E] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Personalizado
              </button>
            </div>

            {!customIssue ? (
              <IconSelect
                options={issueOptions}
                value={formData.issue_type}
                onChange={(value) => setFormData(prev => ({ ...prev, issue_type: value }))}
                placeholder="Selecciona un problema"
                required
              />
            ) : (
              <input
                type="text"
                value={customIssueText}
                onChange={(e) => setCustomIssueText(e.target.value)}
                placeholder="Ej: Cambio de conector de carga, Reparación de flex, etc."
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            )}
          </div>

          {/* Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio (MXN) *
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                $
              </span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2B4E] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Detalles adicionales</h3>
          
          {/* Tiempo estimado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiempo estimado *
            </label>
            <IconSelect
              options={timeOptions}
              value={formData.estimated_time}
              onChange={(value) => setFormData(prev => ({ ...prev, estimated_time: value }))}
              placeholder="Selecciona un tiempo estimado"
              required
            />
          </div>

          {/* Días de garantía */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Garantía
            </label>
            <IconSelect
              options={warrantyOptions}
              value={formData.warranty_days.toString()}
              onChange={(value) => setFormData(prev => ({ ...prev, warranty_days: parseInt(value) }))}
              placeholder="Selecciona la garantía"
            />
          </div>

          {/* Disponibilidad */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="w-4 h-4 text-[#0A2B4E] focus:ring-[#0A2B4E]"
              />
              <span className="text-sm text-gray-700">Servicio disponible</span>
            </label>
          </div>

          {/* Vista previa */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Vista previa del servicio</h4>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FFC107]/20 to-[#2E7D32]/20 rounded-xl flex items-center justify-center">
                  {getDeviceIcon(formData.device_type)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {formData.device_type || 'Dispositivo'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {customIssue ? customIssueText || 'Problema personalizado' : (formData.issue_type || 'Problema')}
                  </p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-[#FFC107]" />
                  <span>{formData.estimated_time || 'Tiempo no especificado'}</span>
                </div>
                <div className="text-lg font-bold text-[#0A2B4E]">
                  ${formData.price.toLocaleString()}
                </div>
              </div>
            </div>
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
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? 'Guardando...' : isEditing ? 'Actualizar servicio' : 'Crear servicio'}
        </button>
      </div>
    </form>
  );
}