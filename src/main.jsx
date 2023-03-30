import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Categories from "./Pages/categories";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/categories",
    element: <Categories />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
