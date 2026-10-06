import { createBrowserRouter, Navigate } from 'react-router';
import PublicLayout from './components/PublicLayout';
import Hero from './components/Hero';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Hero />,
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to={'/'} replace />,
  },
]);

export default router;
