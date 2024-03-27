import React from "react";
import "../styles/categories.css";
import { useURL } from "../utils/useData";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const URL = useURL();
    const { logoutUser } = useUser();
    const navigate = useNavigate();

    const handleClick = () => {
        logoutUser();
        navigate(URL.BASE);
    };

    return (
        <div className="instructionsButton topLeft" onClick={handleClick}>
            Home
        </div>
    );
};

export default Home;
