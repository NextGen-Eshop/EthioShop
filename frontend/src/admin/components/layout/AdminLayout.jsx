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
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface">
      {/* Background gradients from design */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(53,37,205,0.05),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(86,94,116,0.03),_transparent_22%)]" />
      
      <Sidebar
        isOpen={isSidebarOpen}
        isCollapsed={isCollapsed}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className={`transition-all duration-300 ${isCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header
          onMenuClick={() => setIsSidebarOpen(true)}
          onToggleCollapse={() => setIsCollapsed((current) => !current)}
          isCollapsed={isCollapsed}
        />
        
        <section className="mx-auto max-w-[1440px] px-4 pt-24 pb-20 sm:px-6 lg:px-8 lg:pt-28">
          <Outlet />
        </section>

        <Footer />

        {/* Bottom Nav for Mobile */}
        <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-outline-variant/10 bg-white/90 px-6 pb-safe backdrop-blur-xl md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.04)]">
          <a className="flex scale-110 flex-col items-center gap-1 font-bold text-primary transition-transform active:scale-95" href="#">
            <span className="material-symbols-outlined">home</span>
            <span className="text-[10px] uppercase tracking-wide">Home</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-slate-400 transition-transform active:scale-95" href="#">
            <span className="material-symbols-outlined">search</span>
            <span className="text-[10px] uppercase tracking-wide">Search</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-slate-400 transition-transform active:scale-95" href="#">
            <span className="material-symbols-outlined">shopping_cart</span>
            <span className="text-[10px] uppercase tracking-wide">Cart</span>
          </a>
          <a className="flex flex-col items-center gap-1 text-slate-400 transition-transform active:scale-95" href="#">
            <span className="material-symbols-outlined">person</span>
            <span className="text-[10px] uppercase tracking-wide">Profile</span>
          </a>
        </nav>
      </main>
    </div>
  );
}
