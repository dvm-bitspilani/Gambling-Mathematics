import React from "react";
import "../styles/categories.css";
import { useURL } from "../utils/useData";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../contexts/TimerContext";
import { usePathName } from "../utils/useHead";

const Fixed = () => {
    const navigate = useNavigate();
    const pathName = usePathName();
    const { overallFormattedTime, questionFormattedTime, clearAllTimers } =
        useTimer();
    const { logoutUser } = useUser();
    const URL = useURL();

    const questionTimerActive = pathName === URL.QUESTION;
    const displayTimer = questionTimerActive
        ? questionFormattedTime
        : overallFormattedTime;

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
