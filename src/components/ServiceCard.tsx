
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    description: string;
    icon: string;
    basePrice: number;
  };
  onSelect: () => void;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, onSelect }) => {
  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-0 bg-white"
      onClick={onSelect}
    >
      <CardContent className="p-4 text-center">
        <div className="text-3xl mb-3">{service.icon}</div>
        <h3 className="font-medium text-gray-800 mb-2">{service.name}</h3>
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{service.description}</p>
        <div className="text-blue-600 font-semibold">
          Mulai Rp {service.basePrice.toLocaleString('id-ID')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
