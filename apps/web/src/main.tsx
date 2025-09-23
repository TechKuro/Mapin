import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import './index.css';
import Login from './routes/Login';
import Signup from './routes/Signup';
import { AuthGate } from './routes/ProtectedRoute';

const router = createBrowserRouter([
  { path: '/', element: <Signup /> },
  { path: '/app', element: (
      <AuthGate>
        <App />
      </AuthGate>
    ) },
  {
    path: '/login',
    element: <Login />,
  },
]);

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);