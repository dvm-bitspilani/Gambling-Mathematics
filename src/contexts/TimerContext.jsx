import React, { createContext, useState, useContext, useRef } from "react";

const TimerContext = createContext();

export const useTimer = () => {
    const context = useContext(TimerContext);

    if (!context) {
        throw new Error("useTimer must be used within a TimerContextProvider");
    }

    return context;
};

const TimerContextProvider = ({ children }) => {
    const [timer, setTimer] = useState("00:00:00");
    const timerIdRef = useRef(null);

    const startTimer = (minutes, seconds) => {
        if (timerIdRef.current) return;

        const endTime = new Date();
        endTime.setMinutes(endTime.getMinutes() + minutes);
        endTime.setSeconds(endTime.getSeconds() + seconds);

        timerIdRef.current = setInterval(() => {
            const { total, hours, minutes, seconds } =
                getTimeRemaining(endTime);
            if (total <= 0) {
                clearInterval(timerIdRef.current);
                handleTimeout();
            } else {
                setTimer(
                    `${hours > 9 ? hours : "0" + hours}:${minutes > 9 ? minutes : "0" + minutes}:${seconds > 9 ? seconds : "0" + seconds}`
                );
            }
        }, 1000);
    };

    const clearTimer = () => {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
        setTimer("00:00:00");
    };

    const getTimeRemaining = endTime => {
        const total = Date.parse(endTime) - Date.now();
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);

        return { total, hours, minutes, seconds };
    };

    const handleTimeout = () => {
        clearInterval(timerIdRef.current);
        timerIdRef.current = null;
    };

    return (
        <TimerContext.Provider
            value={{ timer, startTimer, clearTimer, handleTimeout }}
        >
            {children}
        </TimerContext.Provider>
    );
};

export default TimerContextProvider;
