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
        questionRemainingTime,
        overallRemainingTime
    } = useTimer();
    const { logoutUser } = useUser();
    const { setErrorText } = useAlert();
    const URL = useURL();

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
            displayRemaining === 0 &&
            questionFormattedTime === "00:00:00"
        ) {
            setErrorText("Time's up! Redirecting you to finish.", URL.FINISHED);
        }
    }, [
        questionTimerActive,
        displayRemaining,
        questionFormattedTime,
        URL,
        setErrorText
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
