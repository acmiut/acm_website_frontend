import { createBrowserRouter, Navigate } from 'react-router';
import PublicLayout from './components/PublicLayout';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <div style={{ paddingTop: '6rem' }}>صفحه اصلی به‌زودی</div>,
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to={'/'} replace />,
  },
]);

export default router;
