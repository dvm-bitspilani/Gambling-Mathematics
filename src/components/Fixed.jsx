import React from "react";
import "../styles/categories.css";
import { useURL } from "../utils/useData";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { usePathName } from "../utils/useHead";

const Fixed = () => {
    // Hooks
    const { logoutUser } = useUser();
    const navigate = useNavigate();
    const pathName = usePathName();
    const URL = useURL();

    // Handlers
    const handleExit = () => {
        logoutUser();
        navigate(URL.BASE);
    };

    const handleLeaderboard = () => {
        navigate(URL.LEADERBOARD);
    };

    return pathName ? (
        <div className="topLeft">
            <div className="instructionsButton" onClick={handleExit}>
                Exit Game
            </div>
            <div className="instructionsButton" onClick={handleLeaderboard}>
                Leaderboard
            </div>
        </div>
    ) : null;
};

export default Fixed;
