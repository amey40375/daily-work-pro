
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Chat = () => {
  const navigate = useNavigate();
  const { partnerId } = useParams();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
          >
            ← Kembali
          </Button>
          <h1 className="text-lg font-semibold">Chat</h1>
          <div></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Live Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500 mb-4">
              Fitur chat akan tersedia segera
            </p>
            <p className="text-sm text-gray-400">
              Partner ID: {partnerId}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;
