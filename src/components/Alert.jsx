import React from "react";
import Modal from "react-modal";
import useAlert from "../utils/useAlert";

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

    return (
        <Modal
            isOpen={error.status || success.status}
            onRequestClose={clearAll}
            style={customModalStyles}
        >
            <div id="err" className="glass">
                <div id="err-head">
                    {error.status ? error.title : success.title}
                </div>
                <div className="reg-par">
                    {error.status ? error.message : success.message}
                </div>
            </div>
        </Modal>
    );
};

export default Alert;
