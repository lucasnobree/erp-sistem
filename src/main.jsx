import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout";
import Dashboard from "./Pages/Dashboard/dashboard.jsx";
import Clientes from "./Pages/Clients/clients.jsx";
import Eventos from "./Pages/Events/events.jsx";
import Login from "./Pages/Login/login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    element: <MainLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "clients",
        element: <Clientes />,
      },
      {
        path: "events",
        element: <Eventos />,
      }
    ]
  }
])

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
