import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useRef
} from "react";
import Cookies from "js-cookie";

const TimerContext = createContext();

export const useTimer = () => {
    const context = useContext(TimerContext);

    if (!context) {
        throw new Error("useTimer must be used within a TimerContextProvider");
    }

    return context;
};

const TimerContextProvider = ({ children }) => {
    const timerIdRef = useRef(null);
    const [timer, setTimer] = useState("00:00:00");

    useEffect(() => {
        const storedTimer = Cookies.get("timer");
        if (storedTimer) {
            setTimer(JSON.parse(storedTimer));
        }
    }, []);

    const startTimer = (minutes, seconds) => {
        if (timerIdRef.current) return;

        const endTime = Date.now() + minutes * 60 * 1000 + seconds * 1000;

        timerIdRef.current = setInterval(() => {
            updateTimer(endTime);
        }, 1000);
    };

    const clearTimer = () => {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
        setTimer("00:00:00");
        Cookies.remove("timer");
    };

    const updateTimer = endTime => {
        const { total, hours, minutes, seconds } = getTimeRemaining(endTime);

        if (total <= 0) {
            clearInterval(timerIdRef.current);
            handleTimeout();
        } else {
            const formattedTime = formatTime(hours, minutes, seconds);
            setTimer(formattedTime);
            Cookies.set("timer", JSON.stringify(formattedTime), { expires: 1 });
        }
    };

    const getTimeRemaining = endTime => {
        const total = endTime - Date.now();
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);

        return { total, hours, minutes, seconds };
    };

    const handleTimeout = () => {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
        Cookies.remove("timer");
    };

    const formatTime = (hours, minutes, seconds) => {
        return `${formatDigit(hours)}:${formatDigit(minutes)}:${formatDigit(seconds)}`;
    };

    const formatDigit = digit => {
        return digit > 9 ? digit : "0" + digit;
    };

    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, []);

    return (
        <TimerContext.Provider
            value={{ timer, startTimer, clearTimer, handleTimeout }}
        >
            {children}
        </TimerContext.Provider>
    );
};

export default TimerContextProvider;
