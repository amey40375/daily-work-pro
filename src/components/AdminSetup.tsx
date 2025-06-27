
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { createAdminAccount } from '@/utils/adminSetup';

const AdminSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateAdmin = async () => {
    setIsCreating(true);
    
    try {
      console.log('Starting admin creation process...');
      const result = await createAdminAccount();
      console.log('Admin creation result:', result);
      
      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create admin account",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error in handleCreateAdmin:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Setup Admin</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Klik tombol dibawah untuk membuat akun admin dengan email: 
          <br />
          <strong>id.arvinstudio@gmail.com</strong>
        </p>
        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Membuat Admin...' : 'Buat Akun Admin'}
        </Button>
        <div className="text-xs text-gray-500 text-center">
          Password default: admin123!@#
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
