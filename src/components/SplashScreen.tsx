
import React from 'react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-600 to-blue-800 flex flex-col items-center justify-center z-50">
      {/* Background Video Effect */}
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse-slow"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-blue-300 rounded-full animate-pulse-slow delay-1000"></div>
        <div className="absolute bottom-32 left-16 w-12 h-12 bg-blue-200 rounded-full animate-pulse-slow delay-2000"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-white rounded-full animate-pulse-slow delay-3000"></div>
      </div>

      {/* Logo and Brand */}
      <div className="relative z-10 text-center animate-bounce-in">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center shadow-2xl">
            <div className="text-4xl font-bold text-blue-600">DW</div>
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2 tracking-wider">
          DAILY WORK
        </h1>
        <p className="text-blue-200 text-lg mb-8 font-light">
          Layanan Jasa Harian Terpercaya
        </p>
        
        {/* Loading Animation */}
        <div className="flex space-x-2 justify-center">
          <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100"></div>
          <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200"></div>
        </div>
      </div>

      {/* Service Icons Animation */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center space-x-8 opacity-30">
        <div className="w-8 h-8 bg-white rounded-lg animate-pulse"></div>
        <div className="w-8 h-8 bg-white rounded-lg animate-pulse delay-500"></div>
        <div className="w-8 h-8 bg-white rounded-lg animate-pulse delay-1000"></div>
        <div className="w-8 h-8 bg-white rounded-lg animate-pulse delay-1500"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
