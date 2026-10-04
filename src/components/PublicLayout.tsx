import { Outlet } from 'react-router';
import Navbar from './Navbar';

export default function PublicLayout() {
  return (
    <div className="lab-shell min-h-screen" dir="rtl" lang="fa">
      <Navbar />
      <Outlet />
    </div>
  );
}
