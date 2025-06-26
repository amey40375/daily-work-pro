
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import SplashScreen from "./components/SplashScreen";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import MitraDashboard from "./pages/MitraDashboard";
import UserDashboard from "./pages/UserDashboard";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 7000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <DataProvider>
              <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
                <Routes>
                  <Route path="/" element={<Login />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/mitra" element={<MitraDashboard />} />
                  <Route path="/user" element={<UserDashboard />} />
                  <Route path="/chat/:partnerId" element={<Chat />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </DataProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
