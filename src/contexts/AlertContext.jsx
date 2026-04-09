import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    useCallback,
    useMemo
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
    const clearTimeoutRef = useRef(null);
    const mountedRef = useRef(true);
    const locationRef = useRef(location.pathname);

    useEffect(() => {
        locationRef.current = location.pathname;
    }, [location.pathname]);

    const [error, setError] = useState(initialState);
    const [success, setSuccess] = useState(initialState);

    const immediateRedirect = useCallback((link, message = null, type = null) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        
        if (message && type === 'success') {
            setSuccess({ status: true, message, title: "SUCCESS" });
            setError(initialState);
        } else if (message && type === 'error') {
            setError({ status: true, message, title: "ERROR" });
            setSuccess(initialState);
        }
        
        if (link) {
            navigate(link);
        }
    }, [navigate]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (clearTimeoutRef.current) {
                clearTimeout(clearTimeoutRef.current);
            }
        };
    }, []);

    const clearAll = useCallback((delay = 0) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (clearTimeoutRef.current) {
            clearTimeout(clearTimeoutRef.current);
        }
        clearTimeoutRef.current = setTimeout(() => {
            if (mountedRef.current) {
                setError(initialState);
                setSuccess(initialState);
            }
        }, delay);
    }, []);

    const handleLink = useCallback(link => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (link) {
            timeoutRef.current = setTimeout(() => {
                if (mountedRef.current) {
                    navigate(link);
                }
            }, 2000);

            intervalRef.current = setInterval(() => {
                const path = locationRef.current.replace(/\/gamblingmaths/g, "");

                if (path === link) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    clearAll();
                }
            }, 1000);
        } else clearAll(3000);
    }, [navigate, clearAll]);

    const setErrorText = useCallback((message, link, title = "ERROR", immediate = false) => {
        if (immediate) {
            immediateRedirect(link, message, 'error');
        } else {
            setError({ status: true, message, title });
            setSuccess(initialState);
            handleLink(link);
        }
    }, [immediateRedirect, handleLink]);

    const setSuccessText = useCallback((message, link, immediate = false) => {
        if (immediate) {
            immediateRedirect(link, message, 'success');
        } else {
            setSuccess({ status: true, message, title: "SUCCESS" });
            setError(initialState);
            handleLink(link);
        }
    }, [immediateRedirect, handleLink]);

    const resetNavigation = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (clearTimeoutRef.current) {
            clearTimeout(clearTimeoutRef.current);
            clearTimeoutRef.current = null;
        }
    }, []);

    const contextValue = useMemo(() => ({
        error,
        success,
        setErrorText,
        setSuccessText,
        clearAll,
        immediateRedirect,
        resetNavigation
    }), [error, success, setErrorText, setSuccessText, clearAll, immediateRedirect, resetNavigation]);

    return (
        <AlertContext.Provider value={contextValue}>
            {children}
        </AlertContext.Provider>
    );
};

export default AlertContextProvider;
