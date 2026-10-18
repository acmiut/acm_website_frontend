import { createBrowserRouter, Navigate } from 'react-router';
import PublicLayout from './components/PublicLayout';
import Hero from './components/Hero';
import RegisterPage from './pages/RegisterPage';
import CheckEmailPage from './pages/CheckEmailPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/',
        element: <Hero />,
      },
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/register/check-email',
        element: <CheckEmailPage />,
      },
      {
        path: '/confirm-email',
        element: <ConfirmEmailPage />,
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to={'/'} replace />,
  },
]);

export default router;
