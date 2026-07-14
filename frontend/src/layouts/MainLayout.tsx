import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import BottomNav from '../components/layout/BottomNav';
import ChatWidget from '../components/common/ChatWidget';

const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#020617]">
      <Navbar />
      
      {/* 
          Padding superior para compensar el Navbar fijo. 
          pt-24 (~96px) en móvil y pt-28 (~112px) en desktop 
          para dar espacio suficiente al diseño expandido del nav.
      */}
      <main className="flex-grow pt-24 md:pt-32">
        <Outlet />
      </main>
      
      <Footer />

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
};

export default MainLayout;
