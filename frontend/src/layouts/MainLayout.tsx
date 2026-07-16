import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BottomNav from '../components/layout/BottomNav';
import { useAuthStore } from '../store/useAuthStore';

const MainLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="flex flex-col min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-500">
      <Navbar />
      
      {/* 
          Padding superior para compensar el Navbar fijo. 
          pt-24 (~96px) para el estado inicial del Nav.
      */}
      <main className="flex-grow pt-24 md:pt-32">
        <Outlet />
      </main>
      
      <Footer />

      {/* Mobile Bottom Navigation - Solo visible si está logueado */}
      {isAuthenticated && (
        <div className="md:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default MainLayout;
