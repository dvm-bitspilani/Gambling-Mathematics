import React from "react";
import Modal from "react-modal";

const Alert = ({ isOpen, setIsOpen, title, message }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={() => setIsOpen(false)}
            style={{
                overlay: { backgroundColor: "rgba(0, 0, 0, 0.4)" },
                content: {
                    width: "max-content",
                    height: "max-content",
                    padding: 0,
                    margin: "auto",
                    backgroundColor: "transparent",
                    border: "none"
                }
            }}
        >
            <div id="err" className="glass">
                <div id="err-head">{title}</div>
                <div className="reg-par">{message}</div>
            </div>
        </Modal>
    );
};

export default Alert;
