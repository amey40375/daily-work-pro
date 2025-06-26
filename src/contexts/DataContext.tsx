
import React, { createContext, useContext, useState, useEffect } from 'react';

interface Service {
  id: string;
  name: string;
  description: string;
  icon: string;
  basePrice: number;
  isActive: boolean;
}

interface Order {
  id: string;
  userId: string;
  mitraId?: string;
  serviceId: string;
  serviceName: string;
  address: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'accepted' | 'on-way' | 'working' | 'completed' | 'cancelled';
  startTime?: string;
  endTime?: string;
  totalAmount?: number;
  workDuration?: number;
  createdAt: string;
  notes?: string;
}

interface DataContextType {
  services: Service[];
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (serviceId: string, updates: Partial<Service>) => void;
  deleteService: (serviceId: string) => void;
  getUserOrders: (userId: string) => Order[];
  getMitraOrders: (mitraId?: string) => Order[];
  getPendingOrders: () => Order[];
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

  // Initialize default services
  useEffect(() => {
    const defaultServices: Service[] = [
      {
        id: '1',
        name: 'Cuci Baju',
        description: 'Layanan cuci baju profesional dengan deterjen berkualitas',
        icon: '👕',
        basePrice: 15000,
        isActive: true
      },
      {
        id: '2',
        name: 'Cuci Baju + Setrika',
        description: 'Paket lengkap cuci baju dan setrika rapi',
        icon: '👔',
        basePrice: 25000,
        isActive: true
      },
      {
        id: '3',
        name: 'Beres-Beres Rumah',
        description: 'Jasa bersih-bersih rumah menyeluruh',
        icon: '🏠',
        basePrice: 100000,
        isActive: true
      },
      {
        id: '4',
        name: 'Potong Rambut',
        description: 'Layanan potong rambut profesional di rumah',
        icon: '✂️',
        basePrice: 50000,
        isActive: true
      }
    ];

    const savedServices = localStorage.getItem('dailywork_services');
    if (!savedServices) {
      setServices(defaultServices);
      localStorage.setItem('dailywork_services', JSON.stringify(defaultServices));
    } else {
      setServices(JSON.parse(savedServices));
    }

    // Load orders
    const savedOrders = localStorage.getItem('dailywork_orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    }
  }, []);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    localStorage.setItem('dailywork_orders', JSON.stringify(updatedOrders));
  };

  const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('dailywork_orders', JSON.stringify(updatedOrders));
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newService: Service = {
      ...serviceData,
      id: Date.now().toString()
    };
    
    const updatedServices = [...services, newService];
    setServices(updatedServices);
    localStorage.setItem('dailywork_services', JSON.stringify(updatedServices));
  };

  const updateService = (serviceId: string, updates: Partial<Service>) => {
    const updatedServices = services.map(service => 
      service.id === serviceId ? { ...service, ...updates } : service
    );
    setServices(updatedServices);
    localStorage.setItem('dailywork_services', JSON.stringify(updatedServices));
  };

  const deleteService = (serviceId: string) => {
    const updatedServices = services.filter(service => service.id !== serviceId);
    setServices(updatedServices);
    localStorage.setItem('dailywork_services', JSON.stringify(updatedServices));
  };

  const getUserOrders = (userId: string) => {
    return orders.filter(order => order.userId === userId);
  };

  const getMitraOrders = (mitraId?: string) => {
    if (!mitraId) return orders.filter(order => order.status === 'pending');
    return orders.filter(order => order.mitraId === mitraId);
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
    getPendingOrders
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
