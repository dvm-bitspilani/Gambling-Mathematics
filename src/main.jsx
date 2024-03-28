import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/main.css";
import Modal from "react-modal";
import UserContextProvider from "./contexts/UserContext";
import AppRoutes from "./AppRoutes";
import Alert from "./components/Alert";
import AlertContextProvider from "./contexts/AlertContext";

Modal.setAppElement("#root");
const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
    <UserContextProvider>
        <AlertContextProvider>
            <Alert />
            <AppRoutes />
        </AlertContextProvider>
    </UserContextProvider>
);
