
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import ServiceCard from '../components/ServiceCard';
import BannerSlider from '../components/BannerSlider';
import OrderForm from '../components/OrderForm';
import OrderHistory from '../components/OrderHistory';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { services, getUserOrders, refreshData } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const userOrders = getUserOrders(user?.id || '');
  const activeOrders = userOrders.filter(order => 
    ['accepted', 'on-way', 'working'].includes(order.status)
  );

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast({
      title: "Logout Berhasil",
      description: "Terima kasih telah menggunakan Daily Work!"
    });
  };

  const handleServiceSelect = (service: any) => {
    setSelectedService(service);
    setShowOrderForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'accepted': return 'bg-blue-500';
      case 'on-way': return 'bg-purple-500';
      case 'working': return 'bg-green-500';
      case 'completed': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu Mitra';
      case 'accepted': return 'Diterima';
      case 'on-way': return 'Dalam Perjalanan';
      case 'working': return 'Sedang Dikerjakan';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Daily Work</h1>
            <p className="text-sm text-gray-600">Halo, {user.name}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="text-red-500 border-red-500 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="flex">
          {[
            { key: 'home', label: 'Beranda', icon: '🏠' },
            { key: 'orders', label: 'Pesanan', icon: '📋' },
            { key: 'history', label: 'Riwayat', icon: '📚' },
            { key: 'profile', label: 'Profil', icon: '👤' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <div className="text-lg">{tab.icon}</div>
              <div className="text-xs mt-1">{tab.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Banner Slider */}
            <BannerSlider />

            {/* Active Orders */}
            {activeOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Pesanan Aktif</h3>
                <div className="space-y-3">
                  {activeOrders.map(order => (
                    <Card key={order.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{order.serviceName}</h4>
                            <p className="text-sm text-gray-600">{order.address}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.scheduled_date).toLocaleDateString('id-ID')} - {order.scheduledTime}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Layanan Tersedia</h3>
              <div className="grid grid-cols-2 gap-4">
                {services
                  .filter(service => service.is_active)
                  .map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      onSelect={() => handleServiceSelect(service)}
                    />
                  ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pesanan Saya</h3>
            <div className="space-y-3">
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Belum ada pesanan aktif</p>
                    <Button
                      onClick={() => setActiveTab('home')}
                      className="mt-3 bg-blue-500 hover:bg-blue-600"
                    >
                      Buat Pesanan
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{order.serviceName}</h4>
                            <p className="text-sm text-gray-600">{order.address}</p>
                          </div>
                          <Badge className={`${getStatusColor(order.status)} text-white`}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                        
                        <div className="text-sm">
                          <p><strong>Jadwal:</strong> {new Date(order.scheduled_date).toLocaleDateString('id-ID')} - {order.scheduledTime}</p>
                          {order.notes && <p><strong>Catatan:</strong> {order.notes}</p>}
                        </div>

                        {order.status === 'working' && order.start_time && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>Sedang Dikerjakan</strong>
                            </p>
                            <p className="text-xs text-green-600">
                              Mulai: {new Date(order.start_time).toLocaleTimeString('id-ID')}
                            </p>
                          </div>
                        )}

                        {order.status === 'completed' && order.total_amount && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm"><strong>Total Biaya:</strong> Rp {order.total_amount.toLocaleString('id-ID')}</p>
                            <p className="text-xs text-gray-600">
                              Durasi: {Math.round((order.duration_minutes || 0))} menit
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <OrderHistory userId={user.id} />
        )}

        {activeTab === 'profile' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil Saya</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Nama</label>
                  <p className="text-gray-800">{user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Telepon</label>
                  <p className="text-gray-800">{user.phone || '-'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Alamat</label>
                  <p className="text-gray-800">{user.address || '-'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedService && (
        <OrderForm
          service={selectedService}
          onClose={() => {
            setShowOrderForm(false);
            setSelectedService(null);
          }}
          onSuccess={() => {
            setShowOrderForm(false);
            setSelectedService(null);
            setActiveTab('orders');
            refreshData();
          }}
        />
      )}
    </div>
  );
};

export default UserDashboard;
