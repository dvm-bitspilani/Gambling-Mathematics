import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialState = { status: false, message: "", title: "" };

const AlertContext = createContext();

export const useAlert = () => {
    const context = useContext(AlertContext);

    if (!context) {
        throw new Error(
            "Alert context must be used within an AlertContextProvider"
        );
    }

    return context;
};

const AlertContextProvider = ({ children }) => {
    const navigate = useNavigate();

    const [error, setError] = useState(initialState);
    const [success, setSuccess] = useState(initialState);

    const handleLink = link => {
        if (link) {
            setTimeout(() => {
                navigate(link);
                setTimeout(() => clearAll(), 1000);
            }, 2000);
        } else {
            setTimeout(() => clearAll(), 3000);
        }
    };

    const setErrorText = (message, link) => {
        setError({ status: true, message, title: "ERROR" });
        setSuccess(initialState);

        handleLink(link);
    };

    const setSuccessText = (message, link) => {
        setSuccess({ status: true, message, title: "SUCCESS" });
        setError(initialState);

        handleLink(link);
    };

    const clearAll = () => {
        setError(initialState);
        setSuccess(initialState);
    };

    // useEffect(() => {
    //     if (error.status || success.status) {
    //         const timer = setTimeout(() => clearAll(), 3000);
    //         return () => clearTimeout(timer);
    //     }
    // }, [error, success]);

    const contextValue = {
        error,
        success,
        setErrorText,
        setSuccessText,
        clearAll
    };

    return (
        <AlertContext.Provider value={contextValue}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContextProvider;
