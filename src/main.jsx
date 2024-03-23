import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/main.css";
import Modal from "react-modal";
import UserContextProvider from "./contexts/UserContext";
import AppRoutes from "./AppRoutes";

Modal.setAppElement("#root");
const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
    <UserContextProvider>
        <AppRoutes />
    </UserContextProvider>
);
