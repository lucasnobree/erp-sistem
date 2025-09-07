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
    path: "/dashboard",
    element: <MainLayout pesquisar={false} />,
    children: [
      {
        path: "",
        element: <Dashboard />,
      },
    ],
  },
  {
    path: "/clients",
    element: <MainLayout />,
    children: [
      {
        path: "",
        element: <Clientes />,
      },
    ],
  },
  {
    path: "/events",
    element: <MainLayout />,
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
    <RouterProvider router={router} />
  </StrictMode>
);
