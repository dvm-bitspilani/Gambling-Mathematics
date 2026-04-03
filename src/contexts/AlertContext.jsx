import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect
} from "react";
import { useNavigate, useLocation } from "react-router-dom";

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
    const location = useLocation();
    const intervalRef = useRef(null);
    const timeoutRef = useRef(null);
    const mountedRef = useRef(true);

    const [error, setError] = useState(initialState);
    const [success, setSuccess] = useState(initialState);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleLink = link => {
        if (link) {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                    navigate(link);
                }
            }, 2000);

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            intervalRef.current = setInterval(() => {
                const path = location.pathname.replace(/\/gamblingmaths/g, "");

                if (path === link) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    clearAll();
                }
            }, 1000);
        } else clearAll(3000);
    };

    const setErrorText = (message, link, title = "ERROR") => {
        setError({ status: true, message, title });
        setSuccess(initialState);

        handleLink(link);
    };

    const setSuccessText = (message, link) => {
        setSuccess({ status: true, message, title: "SUCCESS" });
        setError(initialState);

        handleLink(link);
    };

    const clearAll = (delay = 0) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTimeout(() => {
            if (mountedRef.current) {
                setError(initialState);
                setSuccess(initialState);
            }
        }, delay);
    };

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
