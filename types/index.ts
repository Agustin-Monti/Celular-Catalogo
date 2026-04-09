export type ProductType = 'nuevo' | 'usado' | 'reparacion' | 'accesorio';

export interface Product {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: ProductType;
  price: number;
  original_price?: number;
  condition?: string;
  specs: {
    ram?: string;
    storage?: string;
    camera?: string;
    battery?: string;
    screen?: string;
    [key: string]: any;
  };
  images: string[];
  description?: string;
  stock: number;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RepairService {
  id: string;
  device_type: string;
  issue_type: string;
  price: number;
  estimated_time: string;
  warranty_days: number;
  is_available: boolean;
  created_at?: string;
}

export interface Booking {
  id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: 'reparacion' | 'compra';
  product_id?: string;
  repair_service_id?: string;
  appointment_date?: string;
  appointment_time?: string;
  notes?: string;
  created_at?: string;
  status?: string;
}