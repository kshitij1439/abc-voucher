import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'react-hot-toast';

const Layout = () => {
  return (
    <div className="min-h-screen bg-stone-100">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontFamily: 'var(--font-sans)',
            fontSize: '13px',
            borderRadius: '6px',
            background: '#292524',
            color: '#fafaf9',
          },
        }}
      />
      <Sidebar />
      <main className="ml-60 min-h-screen">
        <div className="p-6 lg:p-8 max-w-7xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
