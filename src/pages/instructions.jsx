import React from "react";
import { useNavigate } from "react-router-dom";
import rules from "../assets/rules.png";
import "../styles/categories.css";
import { useTitle } from "../utils/UseTitle";
import URL from "../urls";

const Instructions = () => {
    useTitle("General Instructions");

    const navigate = useNavigate();

    const handleClick = () => {
        navigate(URL.CATEGORIES);
    };

    const instructionList = [
        "A team can attempt only once.",
        "You will be given 1000 coins initially.",
        "There are 8 categories. You will choose a category and bet some amount of coins.",
        "In each round a player has to bet a minimum of 200 coins.",
        "After betting the coins, you will be shown a question which will have 4 options out of which only 1 will be correct.",
        "If the answer is right you will get the coins back after being multiplied by the multiplier.",
        "If the answer is wrong, the betted coins will be lost.",
        "After attempting one question from the chosen category, you will choose another category and then bet and so on till you complete all the categories.",
        "If you are out of the coins, your game will end.",
        "After attempting all the 8 categories, your final amount of coins will be stored and the top 12 teams according to the number of coins will proceed to the next round.",
        "Ties will be resolved on the basis of time taken to complete the game.",
        "The maximum number of you can bet in each round and its corresponding multiplier is as follows."
    ];

    return (
        <div className="instructions-wrapper">
            <div style={{ textAlign: "center" }} className="title">
                GAMBLING MATHS
            </div>

            <div className="instructions">
                <div className="instructionsTitle">Instructions</div>

                <ul className="instructionsContent">
                    {instructionList.map((instruction, index) => (
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
