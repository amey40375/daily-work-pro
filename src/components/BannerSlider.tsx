
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

const BannerSlider = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = [
    {
      id: 1,
      title: "Promo Cuci Baju + Setrika",
      subtitle: "Hemat 20% untuk paket lengkap!",
      background: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: "👔"
    },
    {
      id: 2,
      title: "Layanan Beres-Beres Rumah",
      subtitle: "Rumah bersih, hidup nyaman",
      background: "bg-gradient-to-r from-green-500 to-green-600",
      icon: "🏠"
    },
    {
      id: 3,
      title: "Potong Rambut di Rumah",
      subtitle: "Praktis tanpa antri",
      background: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: "✂️"
    },
    {
      id: 4,
      title: "Tips Merawat Pakaian",
      subtitle: "Baju awet, tampilan maksimal",
      background: "bg-gradient-to-r from-orange-500 to-orange-600",
      icon: "👕"
    },
    {
      id: 5,
      title: "Mitra Terpercaya",
      subtitle: "100+ mitra profesional siap melayani",
      background: "bg-gradient-to-r from-pink-500 to-pink-600",
      icon: "⭐"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <div className="relative">
      <Card className="overflow-hidden border-0 shadow-lg">
        <div 
          className={`${banners[currentBanner].background} p-6 text-white relative`}
        >
          <div className="flex items-center space-x-4">
            <div className="text-4xl">{banners[currentBanner].icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-1">
                {banners[currentBanner].title}
              </h3>
              <p className="text-sm opacity-90">
                {banners[currentBanner].subtitle}
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-2 right-4 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute bottom-2 right-8 w-8 h-8 bg-white bg-opacity-10 rounded-full"></div>
        </div>
      </Card>

      {/* Indicator dots */}
      <div className="flex justify-center space-x-2 mt-3">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              currentBanner === index ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;
