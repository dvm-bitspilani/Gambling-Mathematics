import React from "react";
import ReactDOM from "react-dom/client";

import Routes from "./routes";
import Modal from "react-modal";
import "./styles/main.css";
import UserContextProvider from "./contexts/UserContext";

Modal.setAppElement("#root");
const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <UserContextProvider>
            <Routes />
        </UserContextProvider>
    </React.StrictMode>
);
