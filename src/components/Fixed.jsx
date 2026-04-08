import React, { useEffect, useState } from "react";
import "../styles/categories.css";
import { useURL } from "../utils/useData";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../contexts/TimerContext";
import { useAlert } from "../contexts/AlertContext";
import { usePathName } from "../utils/useHead";

const Fixed = () => {
    const navigate = useNavigate();
    const pathName = usePathName();
    const {
        overallFormattedTime,
        questionFormattedTime,
        clearAllTimers,
        clearQuestionTimer,
        questionRemainingTime,
        overallRemainingTime,
        questionTimer
    } = useTimer();
    const { logoutUser } = useUser();
    const { setErrorText, immediateRedirect } = useAlert();
    const URL = useURL();
    const TIMER_EXPIRED_FLAG = 'gambling_timer_expired_redirect';

    const [overallTimerActive, setOverallTimerActive] = useState(false);
    const [questionTimerActive, setQuestionTimerActive] = useState(false);

    useEffect(() => {
        const overallPages = [URL.CATEGORIES, URL.SELECT];
        setOverallTimerActive(overallPages.includes(pathName));
        setQuestionTimerActive(pathName === URL.QUESTION);
    }, [pathName, URL]);

    const displayTimer = questionTimerActive
        ? questionFormattedTime
        : overallFormattedTime;
    const displayRemaining = questionTimerActive
        ? questionRemainingTime
        : overallRemainingTime;

    useEffect(() => {
        if (
            questionTimerActive &&
            questionTimer !== null &&
            displayRemaining === 0 &&
            questionFormattedTime === "00:00:00"
        ) {
            if (localStorage.getItem(TIMER_EXPIRED_FLAG)) return;
            localStorage.setItem(TIMER_EXPIRED_FLAG, 'true');
            clearQuestionTimer();
            immediateRedirect(
                URL.CATEGORIES,
                "Time's up! Your bet was lost.",
                'error'
            );
        }
    }, [
        questionTimerActive,
        questionTimer,
        displayRemaining,
        questionFormattedTime,
        URL,
        immediateRedirect,
        clearQuestionTimer
    ]);

    const handleExit = () => {
        clearAllTimers();
        logoutUser();
        navigate(URL.BASE);
    };

    const handleLeaderboard = () => {
        navigate(URL.LEADERBOARD);
    };

    const render = (links, jsx) => {
        return links.includes(pathName) ? null : jsx;
    };

    return pathName === "" ? null : (
        <>
            <div className="topLeft">
                <div className="instructionsButton" onClick={handleExit}>
                    Exit Game
                </div>
                {render(
                    [URL.LEADERBOARD],
                    <div
                        className="instructionsButton"
                        onClick={handleLeaderboard}
                    >
                        Leaderboard
                    </div>
                )}
            </div>
            {render(
                [URL.LEADERBOARD, URL.INSTRUCTIONS, URL.FINISHED],
                <div
                    className="bottomRight"
                    style={{ flexDirection: "column" }}
                >
                    <div className="num" id="timer">
                        {displayTimer}
                    </div>
                    <div className="reg-par" style={{ textAlign: "center" }}>
                        {questionTimerActive ? "Question Time" : "Overall Time"}
                    </div>
                </div>
            )}
        </>
    );
};

export default Fixed;
