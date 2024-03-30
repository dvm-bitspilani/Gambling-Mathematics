import React from "react";
import { useNavigate } from "react-router-dom";
import rules from "../assets/rules.png";
import "../styles/categories.css";
import { useTitle } from "../utils/useHead";
import { useInstructions, useURL } from "../utils/useData";
import { useVerifyAuth } from "../utils/useAuth";

const Instructions = () => {
    // Hooks
    useVerifyAuth();
    useTitle("General Instructions");
    const navigate = useNavigate();
    const instructions = useInstructions();
    const URL = useURL();

    // Event Handler
    const handleClick = () => {
        navigate(URL.CATEGORIES);
    };

    // JSX
    return (
        <div className="instructions-wrapper">
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
