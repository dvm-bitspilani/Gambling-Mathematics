import React from "react";
import { useNavigate } from "react-router-dom";
import rules from "../assets/rules.png";
import "../styles/categories.css";
import { useTitle } from "../utils/useDocument";
import { useVerifyAuth } from "../utils/useAuth";
import { useInstructions, useURL } from "../utils/useData";
import Home from "../components/Home";

const Instructions = () => {
    useVerifyAuth();
    useTitle("General Instructions");

    const URL = useURL();
    const instructions = useInstructions();
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(URL.CATEGORIES);
    };

    return (
        <div className="instructions-wrapper">
            <Home />

            <div style={{ textAlign: "center" }} className="title">
                GAMBLING MATHS
            </div>

            <div className="instructions">
                <div className="instructionsTitle">Instructions</div>

                <ul className="instructionsContent">
                    {instructions.map((instruction, index) => (
                        <li key={index}>{instruction}</li>
                    ))}
                </ul>

                <img className="rules-img" src={rules} alt="RULES" />

                <div className="instructionsButton" onClick={handleClick}>
                    Continue to Play
                </div>
            </div>
        </div>
    );
};

export default Instructions;
