
import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OrderHistoryProps {
  userId: string;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ userId }) => {
  const { getUserOrders } = useData();
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const userOrders = getUserOrders(userId);
  const completedOrders = userOrders.filter(order => order.status === 'completed');

  const filteredOrders = completedOrders.filter(order => {
    const matchesDate = !dateFilter || order.scheduledDate.includes(dateFilter);
    const matchesStatus = !statusFilter || order.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Riwayat Pesanan</h3>
      
      {/* Filters */}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="dateFilter">Filter Tanggal</Label>
            <Input
              id="dateFilter"
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Pilih bulan"
            />
          </div>
          <div>
            <Label htmlFor="statusFilter">Status</Label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="completed">Selesai</option>
            </select>
          </div>
        </div>
        
        {(dateFilter || statusFilter) && (
          <Button
            onClick={() => {
              setDateFilter('');
              setStatusFilter('');
            }}
            variant="outline"
            size="sm"
          >
            Reset Filter
          </Button>
        )}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-500">
                {completedOrders.length === 0 
                  ? "Belum ada riwayat pesanan" 
                  : "Tidak ada pesanan yang sesuai filter"
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map(order => (
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
                  
                  <div className="text-sm space-y-1">
                    <p><strong>Tanggal:</strong> {new Date(order.scheduledDate).toLocaleDateString('id-ID')}</p>
                    <p><strong>Waktu:</strong> {order.scheduledTime}</p>
                    {order.notes && <p><strong>Catatan:</strong> {order.notes}</p>}
                  </div>

                  {order.totalAmount && (
                    <div className="bg-green-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Biaya:</span>
                        <span className="text-green-700 font-bold">
                          Rp {order.totalAmount.toLocaleString('id-ID')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Durasi: {Math.round((order.workDuration || 0) / 60)} menit
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
  );
};

export default OrderHistory;
