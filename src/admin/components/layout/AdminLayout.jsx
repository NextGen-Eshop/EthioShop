import { Outlet, useLocation, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();

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
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </section>

        <Footer />

        {/* Bottom Nav for Mobile */}
        <nav className="fixed bottom-0 left-0 z-50 flex h-20 w-full items-center justify-around border-t border-slate-100 bg-white/95 px-6 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden shadow-[0_-10px_30px_rgba(0,0,0,0.03)] selection:bg-indigo-100">
          <Link to="/admin/overview" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${location.pathname === '/admin/overview' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined font-variation-fill">grid_view</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Home</span>
          </Link>
          <Link to="/admin/products" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${location.pathname === '/admin/products' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Items</span>
          </Link>
          <Link to="/admin/orders" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${location.pathname === '/admin/orders' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">shopping_bag</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Orders</span>
          </Link>
          <Link to="/admin/users" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${location.pathname === '/admin/users' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">group</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Users</span>
          </Link>
          <Link to="/admin/analytics" className={`flex flex-col items-center gap-1 transition-all active:scale-90 ${location.pathname === '/admin/analytics' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined">bar_chart</span>
            <span className="text-[9px] font-bold uppercase tracking-widest">Stats</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
