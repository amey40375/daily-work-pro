
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
      const result = await createAdminAccount();
      
      if (result.success) {
        toast({
          title: "Success",
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
        <CardTitle className="text-center">Admin Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600 text-center">
          Click the button below to create the admin account with email: 
          <br />
          <strong>id.arvinstudio@gmail.com</strong>
        </p>
        <Button 
          onClick={handleCreateAdmin}
          disabled={isCreating}
          className="w-full"
        >
          {isCreating ? 'Creating Admin...' : 'Create Admin Account'}
        </Button>
        <div className="text-xs text-gray-500 text-center">
          Default password: admin123!@#
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminSetup;
