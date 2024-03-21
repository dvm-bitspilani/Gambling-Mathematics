import React from "react";
import ReactDOM from "react-dom";
import Routes from "./routes";
import "./index.css";

const rootElement = document.getElementById("root");

ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
        <Routes />
    </React.StrictMode>
);
