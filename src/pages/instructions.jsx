import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/categories.css";
import { useTitle } from "../utils/useHead";
import { useInstructions, useURL } from "../utils/useData";
import { useVerifyAuth } from "../utils/useAuth";
import { useTimer } from "../contexts/TimerContext";

const Instructions = () => {
    // Hooks
    useVerifyAuth();
    useTitle("General Instructions");
    const navigate = useNavigate();
    const instructions = useInstructions();
    const { startTimer } = useTimer();
    const URL = useURL();

    // Event Handler
    const handleClick = () => {
        startTimer(50, 0);
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
                <div className="instructionsContent">
                    {instructions.map((instruction, index) => (
                        <span key={index}>
                            {typeof instruction === "string" ? (
                                instruction
                            ) : (
                                <ul className="instructionsContent">
                                    {instruction.map(
                                        (subInstruction, subIndex) => (
                                            <li key={subIndex}>
                                                {subInstruction}
                                            </li>
                                        )
                                    )}
                                </ul>
                            )}
                        </span>
                    ))}
                </div>
                <div className="instructionsButton" onClick={handleClick}>
                    Continue to Play
                </div>
            </div>
        </div>
    );
};

export default Instructions;
