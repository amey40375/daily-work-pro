
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { services, orders, addService, updateService, deleteService } = useData();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    icon: '',
    base_price: 0,
    is_active: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }

    // Load pending approvals and users
    const approvals = JSON.parse(localStorage.getItem('pending_mitra_approvals') || '[]');
    const users = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
    setPendingApprovals(approvals);
    setAllUsers(users);
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Logout Berhasil",
      description: "Terima kasih Admin!"
    });
  };

  const handleApproveMitra = (approval: any) => {
    // Update user status
    const users = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === approval.id ? { ...u, isVerified: true } : u
    );
    localStorage.setItem('dailywork_users', JSON.stringify(updatedUsers));

    // Remove from pending approvals
    const updatedApprovals = pendingApprovals.filter(a => a.id !== approval.id);
    setPendingApprovals(updatedApprovals);
    localStorage.setItem('pending_mitra_approvals', JSON.stringify(updatedApprovals));

    setAllUsers(updatedUsers);
    
    toast({
      title: "Mitra Disetujui",
      description: `${approval.name} telah disetujui sebagai mitra`
    });
  };

  const handleRejectMitra = (approval: any) => {
    // Remove user completely
    const users = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== approval.id);
    localStorage.setItem('dailywork_users', JSON.stringify(updatedUsers));

    // Remove from pending approvals
    const updatedApprovals = pendingApprovals.filter(a => a.id !== approval.id);
    setPendingApprovals(updatedApprovals);
    localStorage.setItem('pending_mitra_approvals', JSON.stringify(updatedApprovals));

    setAllUsers(updatedUsers);
    
    toast({
      title: "Mitra Ditolak",
      description: `Pengajuan ${approval.name} telah ditolak`
    });
  };

  const handleToggleMitra = (userId: string, isActive: boolean) => {
    const users = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
    const updatedUsers = users.map((u: any) => 
      u.id === userId ? { ...u, isActive: !isActive } : u
    );
    localStorage.setItem('dailywork_users', JSON.stringify(updatedUsers));
    setAllUsers(updatedUsers);
    
    toast({
      title: isActive ? "Mitra Dinonaktifkan" : "Mitra Diaktifkan",
      description: "Status mitra telah diperbarui"
    });
  };

  const handleServiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingService) {
      updateService(editingService.id, serviceForm);
      toast({
        title: "Layanan Diperbarui",
        description: "Layanan berhasil diperbarui"
      });
    } else {
      addService(serviceForm);
      toast({
        title: "Layanan Ditambahkan",
        description: "Layanan baru berhasil ditambahkan"
      });
    }
    
    setShowServiceForm(false);
    setEditingService(null);
    setServiceForm({
      name: '',
      description: '',
      icon: '',
      base_price: 0,
      is_active: true
    });
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      icon: service.icon,
      base_price: service.base_price,
      is_active: service.is_active
    });
    setShowServiceForm(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Yakin ingin menghapus layanan ini?')) {
      deleteService(serviceId);
      toast({
        title: "Layanan Dihapus",
        description: "Layanan berhasil dihapus"
      });
    }
  };

  const totalRevenue = orders
    .filter(order => order.status === 'completed')
    .reduce((total, order) => total + (order.total_amount || 0), 0);

  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at).toDateString();
    const today = new Date().toDateString();
    return orderDate === today;
  });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-sm text-gray-600">Daily Work Management</p>
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
        <div className="flex overflow-x-auto">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'approvals', label: 'Persetujuan', icon: '✅', count: pendingApprovals.length },
            { key: 'users', label: 'Pengguna', icon: '👥' },
            { key: 'orders', label: 'Pesanan', icon: '📋' },
            { key: 'services', label: 'Layanan', icon: '⚙️' },
            { key: 'revenue', label: 'Pendapatan', icon: '💰' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 py-3 px-4 text-center border-b-2 transition-colors relative ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600 bg-blue-50'
                  : 'border-transparent text-gray-600'
              }`}
            >
              <div className="text-lg">{tab.icon}</div>
              <div className="text-xs mt-1 whitespace-nowrap">{tab.label}</div>
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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Dashboard Overview</h3>
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                  <div className="text-sm text-gray-600">Total Pesanan</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{todayOrders.length}</div>
                  <div className="text-sm text-gray-600">Pesanan Hari Ini</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {allUsers.filter(u => u.role === 'mitra' && u.isVerified).length}
                  </div>
                  <div className="text-sm text-gray-600">Mitra Aktif</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {allUsers.filter(u => u.role === 'user').length}
                  </div>
                  <div className="text-sm text-gray-600">Total User</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-md font-semibold mb-3">Aktivitas Terbaru</h4>
              <div className="space-y-2">
                {orders.slice(-5).reverse().map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium">{order.serviceName}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(order.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <Badge className={`${
                          order.status === 'completed' ? 'bg-green-500' :
                          order.status === 'working' ? 'bg-blue-500' :
                          'bg-yellow-500'
                        } text-white`}>
                          {order.status}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Persetujuan Mitra</h3>
            <div className="space-y-3">
              {pendingApprovals.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Tidak ada pengajuan pending</p>
                  </CardContent>
                </Card>
              ) : (
                pendingApprovals.map(approval => (
                  <Card key={approval.id}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-medium">{approval.name}</h4>
                          <p className="text-sm text-gray-600">{approval.email}</p>
                          <p className="text-sm text-gray-600">{approval.phone}</p>
                        </div>
                        
                        <div className="text-sm">
                          <p><strong>Alamat:</strong> {approval.address}</p>
                          {approval.experience && (
                            <p><strong>Pengalaman:</strong> {approval.experience}</p>
                          )}
                          {approval.skills && (
                            <p><strong>Keahlian:</strong> {approval.skills}</p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleApproveMitra(approval)}
                            className="flex-1 bg-green-500 hover:bg-green-600"
                          >
                            Terima
                          </Button>
                          <Button
                            onClick={() => handleRejectMitra(approval)}
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

        {activeTab === 'users' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Manajemen Pengguna</h3>
            
            {/* User Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-blue-600">
                    {allUsers.filter(u => u.role === 'user').length}
                  </div>
                  <div className="text-sm text-gray-600">Total User</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-xl font-bold text-green-600">
                    {allUsers.filter(u => u.role === 'mitra' && u.isVerified).length}
                  </div>
                  <div className="text-sm text-gray-600">Mitra Aktif</div>
                </CardContent>
              </Card>
            </div>

            {/* Users List */}
            <div className="space-y-3">
              {allUsers.map(user => (
                <Card key={user.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={`${
                          user.role === 'admin' ? 'bg-red-500' :
                          user.role === 'mitra' ? 'bg-blue-500' : 'bg-green-500'
                        } text-white mb-2`}>
                          {user.role.toUpperCase()}
                        </Badge>
                        
                        {user.role === 'mitra' && (
                          <div>
                            <Button
                              onClick={() => handleToggleMitra(user.id, user.isActive !== false)}
                              size="sm"
                              variant={user.isActive !== false ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {user.isActive !== false ? 'Nonaktifkan' : 'Aktifkan'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Semua Pesanan</h3>
            <div className="space-y-3">
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">Belum ada pesanan</p>
                  </CardContent>
                </Card>
              ) : (
                orders.slice().reverse().map(order => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{order.serviceName}</h4>
                          <p className="text-sm text-gray-600">{order.address}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${
                            order.status === 'completed' ? 'bg-green-500' :
                            order.status === 'working' ? 'bg-blue-500' :
                            order.status === 'on-way' ? 'bg-purple-500' :
                            order.status === 'accepted' ? 'bg-orange-500' :
                            'bg-yellow-500'
                          } text-white mb-2`}>
                            {order.status}
                          </Badge>
                          {order.totalAmount && (
                            <div className="text-sm font-medium text-green-600">
                              Rp {order.totalAmount.toLocaleString('id-ID')}
                            </div>
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

        {activeTab === 'services' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manajemen Layanan</h3>
              <Button
                onClick={() => setShowServiceForm(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Tambah Layanan
              </Button>
            </div>
            
            <div className="space-y-3">
              {services.map(service => (
                <Card key={service.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{service.icon}</div>
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600">{service.description}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            Rp {service.base_price.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge className={`${service.is_active ? 'bg-green-500' : 'bg-gray-500'} text-white`}>
                          {service.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button
                            onClick={() => handleEditService(service)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteService(service.id)}
                            size="sm"
                            variant="destructive"
                            className="text-xs"
                          >
                            Hapus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'revenue' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Laporan Pendapatan</h3>
            
            {/* Revenue Summary */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600">
                    Rp {totalRevenue.toLocaleString('id-ID')}
                  </div>
                  <div className="text-gray-600">Total Pendapatan</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <div>
              <h4 className="text-md font-semibold mb-3">Transaksi Terbaru</h4>
              <div className="space-y-3">
                {orders
                  .filter(order => order.status === 'completed' && order.total_amount)
                  .slice(-10)
                  .reverse()
                  .map(order => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{order.serviceName}</h4>
                            <p className="text-sm text-gray-600">
                              {new Date(order.scheduled_date).toLocaleDateString('id-ID')}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              Rp {order.total_amount?.toLocaleString('id-ID')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.round((order.duration_minutes || 0))} menit
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Service Form Modal */}
      <Dialog open={showServiceForm} onOpenChange={setShowServiceForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingService ? 'Edit Layanan' : 'Tambah Layanan Baru'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="serviceName">Nama Layanan</Label>
              <Input
                id="serviceName"
                value={serviceForm.name}
                onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Masukkan nama layanan"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceDescription">Deskripsi</Label>
              <Textarea
                id="serviceDescription"
                value={serviceForm.description}
                onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Masukkan deskripsi layanan"
                required
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="serviceIcon">Icon (Emoji)</Label>
              <Input
                id="serviceIcon"
                value={serviceForm.icon}
                onChange={(e) => setServiceForm(prev => ({ ...prev, icon: e.target.value }))}
                placeholder="🔧"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="servicePrice">Harga Dasar</Label>
              <Input
                id="servicePrice"
                type="number"
                value={serviceForm.base_price}
                onChange={(e) => setServiceForm(prev => ({ ...prev, base_price: parseInt(e.target.value) || 0 }))}
                placeholder="50000"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="serviceActive"
                checked={serviceForm.is_active}
                onChange={(e) => setServiceForm(prev => ({ ...prev, is_active: e.target.checked }))}
              />
              <Label htmlFor="serviceActive">Layanan Aktif</Label>
            </div>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowServiceForm(false);
                  setEditingService(null);
                  setServiceForm({
                    name: '',
                    description: '',
                    icon: '',
                    base_price: 0,
                    is_active: true
                  });
                }}
                className="flex-1"
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600"
              >
                {editingService ? 'Update' : 'Simpan'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
