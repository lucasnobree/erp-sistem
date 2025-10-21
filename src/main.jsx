import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth";
import { NotificationProvider } from "./components/common/Notification/Notification";
import ErrorBoundary from "./components/common/ErrorBoundary/ErrorBoundary";
import { ProtectedRoute } from "./components/common/ProtectedRoute/ProtectedRoute";
import { MainLayout } from "./layouts/MainLayout";
import { LoginPage } from "./features/auth";
import Dashboard from "./Pages/Dashboard/dashboard.jsx";
import Clientes from "./Pages/Clients/clients.jsx";
import Eventos from "./Pages/Events/events.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <MainLayout pesquisar={false} />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/clients",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Clientes />,
      },
    ],
  },
  {
    path: "/events",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "",
        element: <Eventos />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <RouterProvider router={router} />
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
