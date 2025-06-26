
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

const MitraDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, updateOrder, getMitraOrders, getPendingOrders } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [workingOrders, setWorkingOrders] = useState<any[]>([]);
  const [workTimers, setWorkTimers] = useState<Record<string, number>>({});

  const pendingOrders = getPendingOrders();
  const myOrders = getMitraOrders(user?.id);
  const acceptedOrders = myOrders.filter(order => ['accepted', 'on-way', 'working'].includes(order.status));
  const completedOrders = myOrders.filter(order => order.status === 'completed');

  useEffect(() => {
    if (!user || user.role !== 'mitra') {
      navigate('/');
    }
  }, [user, navigate]);

  // Timer effect for working orders
  useEffect(() => {
    const workingOrdersList = myOrders.filter(order => order.status === 'working');
    
    const interval = setInterval(() => {
      workingOrdersList.forEach(order => {
        if (order.startTime) {
          const startTime = new Date(order.startTime).getTime();
          const currentTime = Date.now();
          const duration = currentTime - startTime;
          
          setWorkTimers(prev => ({
            ...prev,
            [order.id]: duration
          }));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [myOrders]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logout Berhasil",
      description: "Terima kasih telah menggunakan Daily Work!"
    });
  };

  const handleAcceptOrder = (orderId: string) => {
    updateOrder(orderId, { 
      status: 'accepted', 
      mitraId: user?.id 
    });
    toast({
      title: "Pesanan Diterima",
      description: "Pesanan telah Anda terima dan berpindah ke pekerjaan Anda"
    });
  };

  const handleRejectOrder = (orderId: string) => {
    updateOrder(orderId, { status: 'cancelled' });
    toast({
      title: "Pesanan Ditolak",
      description: "Pesanan telah ditolak"
    });
  };

  const handleStartTrip = (orderId: string) => {
    updateOrder(orderId, { status: 'on-way' });
    toast({
      title: "Dalam Perjalanan",
      description: "Status diubah menjadi dalam perjalanan"
    });
  };

  const handleStartWork = (orderId: string) => {
    const startTime = new Date().toISOString();
    updateOrder(orderId, { 
      status: 'working',
      startTime: startTime
    });
    toast({
      title: "Mulai Bekerja",
      description: "Timer dimulai, tarif berjalan Rp 100.000/jam"
    });
  };

  const handleFinishWork = (orderId: string) => {
    const order = myOrders.find(o => o.id === orderId);
    if (!order || !order.startTime) return;

    const endTime = new Date().toISOString();
    const startTime = new Date(order.startTime).getTime();
    const finishTime = new Date(endTime).getTime();
    const workDuration = finishTime - startTime; // in milliseconds
    const workHours = workDuration / (1000 * 60 * 60); // convert to hours
    const totalAmount = Math.ceil(workHours * 100000); // Rp 100,000 per hour, rounded up

    updateOrder(orderId, {
      status: 'completed',
      endTime: endTime,
      workDuration: workDuration,
      totalAmount: totalAmount
    });

    // Clear timer
    setWorkTimers(prev => {
      const updated = { ...prev };
      delete updated[orderId];
      return updated;
    });

    toast({
      title: "Pekerjaan Selesai",
      description: `Invoice telah dibuat. Total: Rp ${totalAmount.toLocaleString('id-ID')}`
    });
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const calculateCurrentCost = (milliseconds: number) => {
    const hours = milliseconds / (1000 * 60 * 60);
    return Math.ceil(hours * 100000);
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
      case 'pending': return 'Menunggu';
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
            <h1 className="text-xl font-bold text-gray-800">Mitra Daily Work</h1>
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
            { key: 'pending', label: 'Pesanan Baru', icon: '📋', count: pendingOrders.length },
            { key: 'working', label: 'Pekerjaan Saya', icon: '⚡', count: acceptedOrders.length },
            { key: 'completed', label: 'Selesai', icon: '✅', count: completedOrders.length },
            { key: 'earnings', label: 'Pendapatan', icon: '💰' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 px-2 text-center border-b-2 transition-colors relative ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <div className="text-lg">{tab.icon}</div>
              <div className="text-xs mt-1">{tab.label}</div>
              {tab.count !== undefined && tab.count > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.count}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'pending' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pesanan Masuk</h3>
            <div className="space-y-3">
              {pendingOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Belum ada pesanan masuk</p>
                  </CardContent>
                </Card>
              ) : (
                pendingOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{order.serviceName}</h4>
                            <p className="text-sm text-gray-600">{order.address}</p>
                          </div>
                          <Badge className="bg-yellow-500 text-white">
                            Baru
                          </Badge>
                        </div>
                        
                        <div className="text-sm">
                          <p><strong>Jadwal:</strong> {new Date(order.scheduledDate).toLocaleDateString('id-ID')} - {order.scheduledTime}</p>
                          {order.notes && <p><strong>Catatan:</strong> {order.notes}</p>}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleAcceptOrder(order.id)}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            Terima
                          </Button>
                          <Button
                            onClick={() => handleRejectOrder(order.id)}
                            variant="outline"
                            className="flex-1 border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Tolak
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'working' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pekerjaan Saya</h3>
            <div className="space-y-3">
              {acceptedOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Belum ada pekerjaan aktif</p>
                  </CardContent>
                </Card>
              ) : (
                acceptedOrders.map(order => (
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
                          <p><strong>Jadwal:</strong> {new Date(order.scheduledDate).toLocaleDateString('id-ID')} - {order.scheduledTime}</p>
                          {order.notes && <p><strong>Catatan:</strong> {order.notes}</p>}
                        </div>

                        {order.status === 'working' && workTimers[order.id] && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-700">
                                {formatDuration(workTimers[order.id])}
                              </div>
                              <div className="text-sm text-green-600">
                                Biaya Berjalan: Rp {calculateCurrentCost(workTimers[order.id]).toLocaleString('id-ID')}
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-2">
                          {order.status === 'accepted' && (
                            <Button
                              onClick={() => handleStartTrip(order.id)}
                              className="flex-1 bg-purple-500 hover:bg-purple-600"
                            >
                              Berangkat
                            </Button>
                          )}
                          
                          {order.status === 'on-way' && (
                            <Button
                              onClick={() => handleStartWork(order.id)}
                              className="flex-1 bg-green-500 hover:bg-green-600"
                            >
                              Mulai Bekerja
                            </Button>
                          )}
                          
                          {order.status === 'working' && (
                            <Button
                              onClick={() => handleFinishWork(order.id)}
                              className="flex-1 bg-blue-500 hover:bg-blue-600"
                            >
                              Selesai Bekerja
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pekerjaan Selesai</h3>
            <div className="space-y-3">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Belum ada pekerjaan yang selesai</p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{order.serviceName}</h4>
                            <p className="text-sm text-gray-600">{order.address}</p>
                          </div>
                          <Badge className="bg-gray-500 text-white">
                            Selesai
                          </Badge>
                        </div>
                        
                        <div className="text-sm">
                          <p><strong>Tanggal:</strong> {new Date(order.scheduledDate).toLocaleDateString('id-ID')}</p>
                          <p><strong>Durasi:</strong> {Math.round((order.workDuration || 0) / 60000)} menit</p>
                        </div>

                        {order.totalAmount && (
                          <div className="bg-green-50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">Pendapatan:</span>
                              <span className="text-green-700 font-bold">
                                Rp {order.totalAmount.toLocaleString('id-ID')}
                              </span>
                            </div>
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

        {activeTab === 'earnings' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pendapatan Saya</h3>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {completedOrders.length}
                  </div>
                  <div className="text-sm text-gray-600">Pekerjaan Selesai</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    Rp {completedOrders.reduce((total, order) => total + (order.totalAmount || 0), 0).toLocaleString('id-ID')}
                  </div>
                  <div className="text-sm text-gray-600">Total Pendapatan</div>
                </CardContent>
              </Card>
            </div>

            {/* Earnings History */}
            <div className="space-y-3">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Belum ada pendapatan</p>
                  </CardContent>
                </Card>
              ) : (
                completedOrders.map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{order.serviceName}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(order.scheduledDate).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            +Rp {(order.totalAmount || 0).toLocaleString('id-ID')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round((order.workDuration || 0) / 60000)} menit
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MitraDashboard;
