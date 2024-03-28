import React from "react";
import Modal from "react-modal";
import { useAlert } from "../contexts/AlertContext";

const customModalStyles = {
    overlay: {
        backgroundColor: "rgba(0, 0, 0, 0.4)"
    },
    content: {
        width: "max-content",
        height: "max-content",
        padding: 0,
        margin: "auto",
        backgroundColor: "transparent",
        border: "none"
    }
};

const Alert = () => {
    const { error, success, clearAll } = useAlert();
    const modal = error.status ? error : success;

    return (
        <Modal
            isOpen={modal.status}
            onRequestClose={clearAll}
            style={customModalStyles}
        >
            <div id="err" className="glass">
                <div id="err-head">{modal.title}</div>
                <div className="reg-par">{modal.message}</div>
            </div>
        </Modal>
    );
};

export default Alert;
