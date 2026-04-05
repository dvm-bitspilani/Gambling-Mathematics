import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useRef,
    useCallback
} from "react";

const TimerContext = createContext();

const OVERALL_TIMER_KEY = "overallTimer";
const QUESTION_TIMER_KEY = "questionTimer";
const CONFIG_KEY = "timerConfig";

const DEFAULT_CONFIG = {
    easy: 180,
    medium: 300,
    hard: 420
};

const DEFAULT_OVERALL_SECONDS = 50 * 60;

export const useTimer = () => {
    const context = useContext(TimerContext);

    if (!context) {
        throw new Error("useTimer must be used within a TimerContextProvider");
    }

    return context;
};

const TimerContextProvider = ({ children }) => {
    const overallTimerIdRef = useRef(null);
    const questionTimerIdRef = useRef(null);

    const [overallTimer, setOverallTimer] = useState(null);
    const [overallRemainingTime, setOverallRemainingTime] = useState(0);

    const [questionTimer, setQuestionTimer] = useState(null);
    const [questionRemainingTime, setQuestionRemainingTime] = useState(0);

    const [timerConfig, setTimerConfig] = useState(() => {
        try {
            const stored = localStorage.getItem(CONFIG_KEY);
            return stored ? JSON.parse(stored) : DEFAULT_CONFIG;
        } catch {
            return DEFAULT_CONFIG;
        }
    });

    const [overallTimerSeconds, setOverallTimerSeconds] = useState(() => {
        try {
            const stored = localStorage.getItem("overallTimerSeconds");
            return stored ? parseInt(stored, 10) : DEFAULT_OVERALL_SECONDS;
        } catch {
            return DEFAULT_OVERALL_SECONDS;
        }
    });

    const getStoredOverallTimer = useCallback(() => {
        try {
            const stored = localStorage.getItem(OVERALL_TIMER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }, []);

    const setStoredOverallTimer = useCallback(timerData => {
        try {
            if (timerData) {
                localStorage.setItem(
                    OVERALL_TIMER_KEY,
                    JSON.stringify(timerData)
                );
            } else {
                localStorage.removeItem(OVERALL_TIMER_KEY);
            }
        } catch (error) {
            console.error("Failed to store overall timer:", error);
        }
    }, []);

    const getStoredQuestionTimer = useCallback(() => {
        try {
            const stored = localStorage.getItem(QUESTION_TIMER_KEY);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    }, []);

    const setStoredQuestionTimer = useCallback(timerData => {
        try {
            if (timerData) {
                localStorage.setItem(
                    QUESTION_TIMER_KEY,
                    JSON.stringify(timerData)
                );
            } else {
                localStorage.removeItem(QUESTION_TIMER_KEY);
            }
        } catch (error) {
            console.error("Failed to store question timer:", error);
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

    const clearOverallTimer = useCallback(() => {
        if (overallTimerIdRef.current) {
            clearInterval(overallTimerIdRef.current);
            overallTimerIdRef.current = null;
        }
        setStoredOverallTimer(null);
        setOverallTimer(null);
        setOverallRemainingTime(0);
    }, [setStoredOverallTimer]);

    const clearQuestionTimer = useCallback(
        questionId => {
            if (questionTimerIdRef.current) {
                clearInterval(questionTimerIdRef.current);
                questionTimerIdRef.current = null;
            }

            const stored = getStoredQuestionTimer();
            if (!questionId || (stored && stored.questionId === questionId)) {
                setStoredQuestionTimer(null);
                setQuestionTimer(null);
                setQuestionRemainingTime(0);
            }
        },
        [getStoredQuestionTimer, setStoredQuestionTimer]
    );

    const clearAllTimers = useCallback(() => {
        clearOverallTimer();
        clearQuestionTimer();
    }, [clearOverallTimer, clearQuestionTimer]);

    const startOverallTimer = useCallback(
        (customSeconds = null) => {
            const duration = customSeconds || overallTimerSeconds;
            const endTime = Date.now() + duration * 1000;

            setStoredOverallTimer({ endTime, duration });
            setOverallTimer({ endTime });
            setOverallRemainingTime(duration);

            if (overallTimerIdRef.current) {
                clearInterval(overallTimerIdRef.current);
            }

            overallTimerIdRef.current = setInterval(() => {
                const remaining = getTimeRemaining(endTime);

                if (remaining <= 0) {
                    clearInterval(overallTimerIdRef.current);
                    overallTimerIdRef.current = null;
                    setOverallRemainingTime(0);
                    setStoredOverallTimer(null);
                } else {
                    setOverallRemainingTime(remaining);
                }
            }, 1000);

            return duration;
        },
        [overallTimerSeconds, setStoredOverallTimer, getTimeRemaining]
    );

    const restoreOverallTimer = useCallback(() => {
        const stored = getStoredOverallTimer();

        if (!stored) {
            return false;
        }

        if (Date.now() >= stored.endTime) {
            setStoredOverallTimer(null);
            return { expired: true };
        }

        const remaining = getTimeRemaining(stored.endTime);
        setOverallTimer({ endTime: stored.endTime });
        setOverallRemainingTime(remaining);

        if (overallTimerIdRef.current) {
            clearInterval(overallTimerIdRef.current);
        }

        overallTimerIdRef.current = setInterval(() => {
            const newRemaining = getTimeRemaining(stored.endTime);

            if (newRemaining <= 0) {
                clearInterval(overallTimerIdRef.current);
                overallTimerIdRef.current = null;
                setOverallRemainingTime(0);
                setStoredOverallTimer(null);
            } else {
                setOverallRemainingTime(newRemaining);
            }
        }, 1000);

        return { restored: true, remainingTime: remaining };
    }, [getStoredOverallTimer, setStoredOverallTimer, getTimeRemaining]);

    const hasExpiredQuestionTimer = useCallback(
        questionId => {
            const stored = getStoredQuestionTimer();
            if (!stored || stored.questionId !== questionId) {
                return false;
            }
            return Date.now() >= stored.endTime;
        },
        [getStoredQuestionTimer]
    );

    const getQuestionRemainingTime = useCallback(
        questionId => {
            const stored = getStoredQuestionTimer();
            if (!stored || stored.questionId !== questionId) {
                return 0;
            }
            return getTimeRemaining(stored.endTime);
        },
        [getStoredQuestionTimer, getTimeRemaining]
    );

    const startQuestionTimer = useCallback(
        (questionId, level, customDuration = null) => {
            const duration =
                customDuration ||
                timerConfig[level] ||
                timerConfig.medium ||
                300;
            const endTime = Date.now() + duration * 1000;

            setStoredQuestionTimer({
                questionId,
                endTime,
                level
            });

            setQuestionTimer({ questionId, level, endTime });
            setQuestionRemainingTime(duration);

            if (questionTimerIdRef.current) {
                clearInterval(questionTimerIdRef.current);
            }

            questionTimerIdRef.current = setInterval(() => {
                const remaining = getTimeRemaining(endTime);

                if (remaining <= 0) {
                    clearInterval(questionTimerIdRef.current);
                    questionTimerIdRef.current = null;
                    setQuestionRemainingTime(0);
                    setStoredQuestionTimer(null);
                } else {
                    setQuestionRemainingTime(remaining);
                }
            }, 1000);

            return duration;
        },
        [timerConfig, setStoredQuestionTimer, getTimeRemaining]
    );

    const restoreQuestionTimer = useCallback(() => {
        const stored = getStoredQuestionTimer();

        if (!stored) {
            return false;
        }

        if (Date.now() >= stored.endTime) {
            setStoredQuestionTimer(null);
            return { expired: true, questionId: stored.questionId };
        }

        const remaining = getTimeRemaining(stored.endTime);
        setQuestionTimer({
            questionId: stored.questionId,
            level: stored.level,
            endTime: stored.endTime
        });
        setQuestionRemainingTime(remaining);

        if (questionTimerIdRef.current) {
            clearInterval(questionTimerIdRef.current);
        }

        questionTimerIdRef.current = setInterval(() => {
            const newRemaining = getTimeRemaining(stored.endTime);

            if (newRemaining <= 0) {
                clearInterval(questionTimerIdRef.current);
                questionTimerIdRef.current = null;
                setQuestionRemainingTime(0);
                setStoredQuestionTimer(null);
            } else {
                setQuestionRemainingTime(newRemaining);
            }
        }, 1000);

        return {
            restored: true,
            questionId: stored.questionId,
            level: stored.level,
            remainingTime: remaining
        };
    }, [getStoredQuestionTimer, setStoredQuestionTimer, getTimeRemaining]);

    const updateTimerConfig = useCallback(config => {
        const newConfig = { ...DEFAULT_CONFIG, ...config };
        setTimerConfig(newConfig);
        try {
            localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
        } catch (error) {
            console.error("Failed to store timer config:", error);
        }
    }, []);

    const setOverallDuration = useCallback(seconds => {
        const duration = seconds || DEFAULT_OVERALL_SECONDS;
        setOverallTimerSeconds(duration);
        try {
            localStorage.setItem("overallTimerSeconds", duration.toString());
        } catch (error) {
            console.error("Failed to store overall timer seconds:", error);
        }
    }, []);

    const getOverallTimerState = useCallback(() => {
        return {
            timer: overallTimer,
            remainingTime: overallRemainingTime,
            formattedTime: formatTime(overallRemainingTime),
            isActive: !!overallTimer
        };
    }, [overallTimer, overallRemainingTime]);

    const getQuestionTimerState = useCallback(() => {
        return {
            timer: questionTimer,
            remainingTime: questionRemainingTime,
            formattedTime: formatTime(questionRemainingTime),
            isActive: !!questionTimer
        };
    }, [questionTimer, questionRemainingTime]);

    useEffect(() => {
        return () => {
            if (overallTimerIdRef.current) {
                clearInterval(overallTimerIdRef.current);
            }
            if (questionTimerIdRef.current) {
                clearInterval(questionTimerIdRef.current);
            }
        };
    }, []);

    const value = {
        timerConfig,
        overallTimer,
        overallRemainingTime,
        overallFormattedTime: formatTime(overallRemainingTime),
        questionTimer,
        questionRemainingTime,
        questionFormattedTime: formatTime(questionRemainingTime),
        startOverallTimer,
        restoreOverallTimer,
        clearOverallTimer,
        startQuestionTimer,
        restoreQuestionTimer,
        getQuestionRemainingTime,
        clearQuestionTimer,
        clearAllTimers,
        hasExpiredQuestionTimer,
        updateTimerConfig,
        setOverallDuration,
        getOverallTimerState,
        getQuestionTimerState
    };

    return (
        <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
    );
};

export default TimerContextProvider;
