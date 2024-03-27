import { useState, useEffect, useRef } from "react";

const useTimer = (initialTime = 180000) => {
    const [time, setTime] = useState(initialTime);
    const [isActive, setIsActive] = useState(true);
    const countRef = useRef(null);

    const startTimer = () => {
        setIsActive(true);
    };

    const pauseTimer = () => {
        setIsActive(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTime(initialTime);
    };

    useEffect(() => {
        if (isActive) {
            countRef.current = setInterval(() => {
                setTime(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(countRef.current);
                        return 0;
                    }
                    return prevTime - 1000;
                });
            }, 1000);
        } else {
            clearInterval(countRef.current);
        }

        return () => clearInterval(countRef.current);
    }, [isActive, initialTime]);

    return { time, startTimer, pauseTimer, resetTimer };
};

export default useTimer;
