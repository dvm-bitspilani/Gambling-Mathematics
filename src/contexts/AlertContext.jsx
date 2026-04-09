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
    const timeoutRef = useRef(null);
    const clearTimeoutRef = useRef(null);
    const mountedRef = useRef(true);
    const pendingRedirectRef = useRef(null);

    useEffect(() => {
        const pendingRedirect = pendingRedirectRef.current;

        if (!pendingRedirect) {
            return;
        }

        if (location.pathname === pendingRedirect.target) {
            pendingRedirectRef.current = null;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            clearAll();
            return;
        }

        if (location.pathname !== pendingRedirect.originPath) {
            pendingRedirectRef.current = null;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        }
    }, [location.pathname]);

    const [error, setError] = useState(initialState);
    const [success, setSuccess] = useState(initialState);

    const immediateRedirect = useCallback((link, message = null, type = null) => {
        pendingRedirectRef.current = null;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        
        if (message && type === "success") {
            setSuccess({ status: true, message, title: "SUCCESS" });
            setError(initialState);
        } else if (message && type === "error") {
            setError({ status: true, message, title: "ERROR" });
            setSuccess(initialState);
        }
        
        if (link) {
            navigate(link, { replace: true });
        }
    }, [navigate]);

    useEffect(() => {
        return () => {
            mountedRef.current = false;
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            if (clearTimeoutRef.current) {
                clearTimeout(clearTimeoutRef.current);
            }
        };
    }, []);

    const clearAll = useCallback((delay = 0) => {
        pendingRedirectRef.current = null;
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
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

        if (link) {
            const pendingRedirect = {
                id: Date.now(),
                target: link,
                originPath: location.pathname
            };
            pendingRedirectRef.current = pendingRedirect;
            timeoutRef.current = setTimeout(() => {
                if (
                    mountedRef.current &&
                    pendingRedirectRef.current?.id === pendingRedirect.id
                ) {
                    navigate(link, { replace: true });
                }
            }, 2000);
        } else {
            clearAll(3000);
        }
    }, [navigate, clearAll, location.pathname]);

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
        if (clearTimeoutRef.current) {
            clearTimeout(clearTimeoutRef.current);
            clearTimeoutRef.current = null;
        }
        pendingRedirectRef.current = null;
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
