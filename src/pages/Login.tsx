
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import RegistrationForm from '../components/RegistrationForm';
import AdminSetup from '../components/AdminSetup';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationType, setRegistrationType] = useState<'user' | 'mitra'>('user');
  const [showMitraPending, setShowMitraPending] = useState(false);
  const [showAdminSetup, setShowAdminSetup] = useState(false);
  
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Mohon isi email dan password",
        variant: "destructive"
      });
      return;
    }

    const success = await login(email, password);
    
    if (success) {
      // Determine redirect based on email and role
      if (email === 'id.arvinstudio@gmail.com') {
        navigate('/admin');
      } else {
        // Get user role from localStorage
        const savedUser = JSON.parse(localStorage.getItem('dailywork_user') || '{}');
        
        if (savedUser.role === 'mitra') {
          navigate('/mitra');
        } else {
          navigate('/user');
        }
      }
      
      toast({
        title: "Berhasil Login",
        description: "Selamat datang di Daily Work!"
      });
    } else {
      // Check if it's a pending mitra
      try {
        const savedUsers = JSON.parse(localStorage.getItem('dailywork_users') || '[]');
        const user = savedUsers.find((u: any) => u.email === email && u.password === password);
        
        if (user && user.role === 'mitra') {
          const approvedMitras = JSON.parse(localStorage.getItem('dailywork_approved_mitras') || '[]');
          if (!approvedMitras.includes(user.id)) {
            setShowMitraPending(true);
            return;
          }
        }
      } catch (error) {
        console.log('Error checking user status');
      }
      
      toast({
        title: "Login Gagal",
        description: "Email atau password salah",
        variant: "destructive"
      });
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/6281299660660', '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-blue-100">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-8">
          <div className="w-20 h-20 mx-auto bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-white">DW</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-800">DAILY WORK</CardTitle>
          <p className="text-gray-600">Layanan Jasa Harian Terpercaya</p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="h-12"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password Anda"
                className="h-12"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Memproses...' : 'Login'}
            </Button>
          </form>
          
          <div className="mt-6 space-y-3 text-center">
            <Button
              variant="outline"
              onClick={() => setShowRegistration(true)}
              className="w-full h-12 border-blue-500 text-blue-500 hover:bg-blue-50"
            >
              Pendaftaran
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowAdminSetup(true)}
              className="w-full h-12 border-gray-500 text-gray-500 hover:bg-gray-50"
            >
              Setup Admin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Registration Type Selection Dialog */}
      <Dialog open={showRegistration} onOpenChange={setShowRegistration}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Pilih Jenis Pendaftaran</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              onClick={() => {
                setRegistrationType('user');
                setShowRegistration(false);
              }}
              className="w-full h-12 bg-blue-500 hover:bg-blue-600"
            >
              Pendaftaran User Baru
            </Button>
            <Button
              onClick={() => {
                setRegistrationType('mitra');
                setShowRegistration(false);
              }}
              variant="outline"
              className="w-full h-12 border-blue-500 text-blue-500"
            >
              Pendaftaran Mitra Baru
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mitra Pending Approval Dialog */}
      <Dialog open={showMitraPending} onOpenChange={setShowMitraPending}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Menunggu Konfirmasi Admin</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Mohon Maaf Anda Belum Bisa Masuk Ke Halaman Mitra Karena Admin Belum Konfirmasi Pengajuan Anda. 
              Apabila Anda Ingin Lebih Fast Respon Silahkan Hubungi Admin VIA WhatsApp
            </p>
            <Button
              onClick={openWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Hubungi Admin via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Setup Dialog */}
      <Dialog open={showAdminSetup} onOpenChange={setShowAdminSetup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Setup Admin Account</DialogTitle>
          </DialogHeader>
          <AdminSetup />
        </DialogContent>
      </Dialog>

      {/* Registration Form */}
      {!showRegistration && (
        <RegistrationForm
          type={registrationType}
          onClose={() => setRegistrationType('user')}
        />
      )}
    </div>
  );
};

export default Login;
