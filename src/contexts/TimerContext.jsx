import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useRef,
    useCallback
} from "react";

const TimerContext = createContext();

const STORAGE_KEY = "questionTimer";
const CONFIG_KEY = "timerConfig";

const DEFAULT_CONFIG = {
    easy: 180,
    medium: 300,
    hard: 420
};

export const useTimer = () => {
    const context = useContext(TimerContext);

    if (!context) {
        throw new Error("useTimer must be used within a TimerContextProvider");
    }

    return context;
};

const TimerContextProvider = ({ children }) => {
    const timerIdRef = useRef(null);
    const [currentTimer, setCurrentTimer] = useState(null);
    const [remainingTime, setRemainingTime] = useState(0);
    const [timerConfig, setTimerConfig] = useState(() => {
        try {
            const stored = localStorage.getItem(CONFIG_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
        } catch {
            return DEFAULT_CONFIG;
        }
    });

    const getStoredTimer = useCallback(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }, []);

    const setStoredTimer = useCallback(timerData => {
        try {
            if (timerData) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(timerData));
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (error) {
            console.error("Failed to store timer:", error);
        }
    }, []);

    const formatTime = totalSeconds => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const formatDigit = digit => (digit > 9 ? digit : "0" + digit);

        return `${formatDigit(hours)}:${formatDigit(minutes)}:${formatDigit(seconds)}`;
    };

    const getTimeRemaining = useCallback(endTime => {
        const total = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        return total;
    }, []);

    const clearQuestionTimer = useCallback(
        questionId => {
            if (timerIdRef.current) {
                clearInterval(timerIdRef.current);
                timerIdRef.current = null;
            }

            const stored = getStoredTimer();
            if (!questionId || (stored && stored.questionId === questionId)) {
                setStoredTimer(null);
                setCurrentTimer(null);
                setRemainingTime(0);
            }
        },
        [getStoredTimer, setStoredTimer]
    );

    const clearAllTimers = useCallback(() => {
        if (timerIdRef.current) {
            clearInterval(timerIdRef.current);
            timerIdRef.current = null;
        }
        setStoredTimer(null);
        setCurrentTimer(null);
        setRemainingTime(0);
    }, [setStoredTimer]);

    const hasExpiredTimer = useCallback(
        questionId => {
            const stored = getStoredTimer();
            if (!stored || stored.questionId !== questionId) {
                return false;
            }
            return Date.now() >= stored.endTime;
        },
        [getStoredTimer]
    );

    const getRemainingTime = useCallback(
        questionId => {
            const stored = getStoredTimer();
            if (!stored || stored.questionId !== questionId) {
                return 0;
            }
            return getTimeRemaining(stored.endTime);
        },
        [getStoredTimer, getTimeRemaining]
    );

    const startQuestionTimer = useCallback(
        (questionId, level, customDurations = null) => {
            const durations = customDurations || timerConfig;
            const duration = durations[level] || durations.medium || 300;
            const endTime = Date.now() + duration * 1000;

            setStoredTimer({
                questionId,
                endTime,
                level
            });

            setCurrentTimer({ questionId, level, endTime });
            setRemainingTime(duration);

            if (timerIdRef.current) {
                clearInterval(timerIdRef.current);
            }

            timerIdRef.current = setInterval(() => {
                const remaining = getTimeRemaining(endTime);

                if (remaining <= 0) {
                    clearInterval(timerIdRef.current);
                    timerIdRef.current = null;
                    setRemainingTime(0);
                    setStoredTimer(null);
                } else {
                    setRemainingTime(remaining);
                }
            }, 1000);

            return duration;
        },
        [timerConfig, setStoredTimer, getTimeRemaining]
    );

    const updateTimerConfig = useCallback(config => {
        const newConfig = { ...DEFAULT_CONFIG, ...config };
        setTimerConfig(newConfig);
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
        } catch (error) {
            console.error("Failed to store timer config:", error);
        }
    }, []);

    const restoreTimer = useCallback(() => {
        const stored = getStoredTimer();

        if (!stored) {
            return false;
        }

        if (Date.now() >= stored.endTime) {
            setStoredTimer(null);
            return { expired: true, questionId: stored.questionId };
        }

        const remaining = getTimeRemaining(stored.endTime);
        setCurrentTimer({
            questionId: stored.questionId,
            level: stored.level,
            endTime: stored.endTime
        });
        setRemainingTime(remaining);

        if (timerIdRef.current) {
            clearInterval(timerIdRef.current);
        }

        timerIdRef.current = setInterval(() => {
            const newRemaining = getTimeRemaining(stored.endTime);

            if (newRemaining <= 0) {
                clearInterval(timerIdRef.current);
                timerIdRef.current = null;
                setRemainingTime(0);
                setStoredTimer(null);
            } else {
                setRemainingTime(newRemaining);
            }
        }, 1000);

        return {
            restored: true,
            questionId: stored.questionId,
            level: stored.level,
            remainingTime: remaining
        };
    }, [getStoredTimer, setStoredTimer, getTimeRemaining]);

    const getTimerState = useCallback(() => {
        return {
            currentTimer,
            remainingTime,
            formattedTime: formatTime(remainingTime),
            isActive: !!currentTimer
        };
    }, [currentTimer, remainingTime]);

    useEffect(() => {
        return () => {
            if (timerIdRef.current) {
                clearInterval(timerIdRef.current);
            }
        };
    }, []);

    const value = {
        timerConfig,
        currentTimer,
        remainingTime,
        formattedTime: formatTime(remainingTime),
        getStoredTimer,
        startQuestionTimer,
        getRemainingTime,
        clearQuestionTimer,
        clearAllTimers,
        hasExpiredTimer,
        updateTimerConfig,
        restoreTimer,
        getTimerState
    };

    return (
        <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
    );
};

export default TimerContextProvider;
