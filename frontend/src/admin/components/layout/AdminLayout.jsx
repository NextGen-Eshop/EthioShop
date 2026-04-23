import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setIsSidebarOpen(false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Subtle background gradients */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.04),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.03),_transparent_25%)]" />

      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleCollapse={() => setIsCollapsed((c) => !c)}
          isCollapsed={isCollapsed}
        />

        <section className="mx-auto max-w-[1440px] px-4 pt-24 pb-20 sm:px-6 lg:px-8">
          <Outlet />
        </section>

        <Footer />
      </main>
    </div>
  );
}
