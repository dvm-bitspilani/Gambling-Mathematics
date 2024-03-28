import React from "react";
import "../styles/categories.css";
import { useURL } from "../utils/useData";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { usePathName } from "../utils/useHead";

const Exit = () => {
    const URL = useURL();
    const { logoutUser } = useUser();
    const pathName = usePathName();
    const navigate = useNavigate();

    const handleClick = () => {
        logoutUser();
        navigate(URL.BASE);
    };

    return pathName ? (
        <div className="instructionsButton topLeft" onClick={handleClick}>
            Exit Game
        </div>
    ) : null;
};

export default Exit;
