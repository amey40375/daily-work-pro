
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  base_price: number;
  is_active: boolean;
}

interface Order {
  id: string;
  user_id: string;
  mitra_id?: string;
  service_id: string;
  serviceName: string;
  address: string;
  scheduled_date: string;
  scheduledTime: string;
  status: 'pending' | 'accepted' | 'on-way' | 'working' | 'completed' | 'cancelled';
  start_time?: string;
  end_time?: string;
  total_amount?: number;
  duration_minutes?: number;
  created_at: string;
  notes?: string;
}

interface DataContextType {
  services: Service[];
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'created_at'>) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (serviceId: string, updates: Partial<Service>) => Promise<void>;
  deleteService: (serviceId: string) => Promise<void>;
  getUserOrders: (userId: string) => Order[];
  getMitraOrders: (mitraId?: string) => Order[];
  getPendingOrders: () => Order[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (undefined === context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const { user, session } = useAuth();

  // Load data when user is authenticated
  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [session]);

  const refreshData = async () => {
    try {
      // Load services
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .order('created_at');

      if (servicesData) {
        const mappedServices = servicesData.map(service => ({
          id: service.id,
          name: service.name,
          description: service.description || '',
          icon: getServiceIcon(service.name),
          base_price: Number(service.base_price),
          is_active: service.is_active
        }));
        setServices(mappedServices);
      }

      // Load orders
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          services(name)
        `)
        .order('created_at', { ascending: false });

      if (ordersData) {
        const mappedOrders = ordersData.map(order => ({
          id: order.id,
          user_id: order.user_id,
          mitra_id: order.mitra_id,
          service_id: order.service_id,
          serviceName: order.services?.name || 'Unknown Service',
          address: order.address,
          scheduled_date: order.scheduled_date.split('T')[0],
          scheduledTime: new Date(order.scheduled_date).toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          status: mapOrderStatus(order.status) as 'pending' | 'accepted' | 'on-way' | 'working' | 'completed' | 'cancelled',
          start_time: order.start_time,
          end_time: order.end_time,
          total_amount: order.total_amount ? Number(order.total_amount) : undefined,
          duration_minutes: order.duration_minutes,
          created_at: order.created_at,
          notes: order.notes
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('cuci baju + setrika')) return '👔';
    if (serviceName.toLowerCase().includes('cuci baju')) return '👕';
    if (serviceName.toLowerCase().includes('beres-beres')) return '🏠';
    if (serviceName.toLowerCase().includes('potong rambut')) return '✂️';
    return '🔧';
  };

  const mapOrderStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'accepted': 'accepted',
      'in_progress': 'on-way',
      'working': 'working',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || status;
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'created_at'>) => {
    try {
      const scheduledDateTime = new Date(`${orderData.scheduled_date}T${orderData.scheduledTime}`);
      
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: orderData.user_id,
          service_id: orderData.service_id,
          address: orderData.address,
          scheduled_date: scheduledDateTime.toISOString(),
          status: 'pending',
          notes: orderData.notes
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (orderId: string, updates: Partial<Order>) => {
    try {
      const dbUpdates: any = {};
      
      if (updates.status) {
        const statusMap: { [key: string]: string } = {
          'pending': 'pending',
          'accepted': 'accepted',
          'on-way': 'in_progress',
          'working': 'working',
          'completed': 'completed',
          'cancelled': 'cancelled'
        };
        dbUpdates.status = statusMap[updates.status];
      }
      
      if (updates.mitra_id) dbUpdates.mitra_id = updates.mitra_id;
      if (updates.start_time) dbUpdates.start_time = updates.start_time;
      if (updates.end_time) dbUpdates.end_time = updates.end_time;
      if (updates.total_amount) dbUpdates.total_amount = updates.total_amount;
      if (updates.duration_minutes) dbUpdates.duration_minutes = updates.duration_minutes;

      const { error } = await supabase
        .from('orders')
        .update(dbUpdates)
        .eq('id', orderId);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const addService = async (serviceData: Omit<Service, 'id'>) => {
    try {
      const { error } = await supabase
        .from('services')
        .insert({
          name: serviceData.name,
          description: serviceData.description,
          base_price: serviceData.base_price,
          is_active: serviceData.is_active
        });

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  };

  const updateService = async (serviceId: string, updates: Partial<Service>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.base_price !== undefined) dbUpdates.base_price = updates.base_price;
      if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;

      const { error } = await supabase
        .from('services')
        .update(dbUpdates)
        .eq('id', serviceId);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  };

  const deleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      await refreshData();
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.user_id === userId);
  };

  const getMitraOrders = (mitraId?: string) => {
    if (!mitraId) return orders.filter(order => order.status === 'pending');
    return orders.filter(order => order.mitra_id === mitraId);
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending');
  };

  const value = {
    services,
    orders,
    addOrder,
    updateOrder,
    addService,
    updateService,
    deleteService,
    getUserOrders,
    getMitraOrders,
    getPendingOrders,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
