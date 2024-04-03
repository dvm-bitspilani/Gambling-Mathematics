import React, { useEffect, useState } from "react";
import "../styles/categories.css";
import { useURL } from "../utils/useData";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { useTimer } from "../contexts/TimerContext";
import { useAlert } from "../contexts/AlertContext";
import { usePathName } from "../utils/useHead";

const Fixed = () => {
    // Hooks
    const navigate = useNavigate();
    const pathName = usePathName();
    const { timer } = useTimer();
    const { logoutUser } = useUser();
    const { setErrorText } = useAlert();
    const URL = useURL();

    // States
    const [timerActive, setTimerActive] = useState(false);

    // Effects
    useEffect(() => {
        const activePages = [URL.CATEGORIES, URL.QUESTION, URL.SELECT];
        setTimerActive(activePages.includes(pathName) && timer !== "00:00:00");
    }, [pathName, timer]);

    useEffect(() => {
        if (timerActive && timer === "00:00:00") {
            setErrorText("Time's up! Redirecting you to finish.", URL.FINISHED);
        }
    }, [timerActive, timer]);

    // Handlers
    const handleExit = () => {
        logoutUser();
        navigate(URL.BASE);
    };

    const handleLeaderboard = () => {
        navigate(URL.LEADERBOARD);
    };

    // Functions
    const render = (links, jsx) => {
        return links.includes(pathName) ? null : jsx;
    };

    // JSX
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
                        {timer}
                    </div>
                    <div className="reg-par" style={{ textAlign: "center" }}>
                        Time Remaining
                    </div>
                </div>
            )}
        </>
    );
};

export default Fixed;
