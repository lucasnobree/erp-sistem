import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./Pages/Dashboard/dashboard.jsx";
import Clientes from "./Pages/Clients/clients.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout nomeTela="Dashboard" />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "clients",
        element: <Clientes />,
      }
    ]
  }
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
