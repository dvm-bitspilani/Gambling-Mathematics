import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import rules from "../Asset/rules.png";
import "../Styles/categories.css";

const Instructions = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Gambling Maths | General Instructions";
  }, []);

  return (
    <div className="instructions-wrapper">
      <div style={{ textAlign: "center" }} className="title">
        GAMBLING MATHS
      </div>

      <div className="instructions">
        <div className="instructionsTitle">Instructions</div>

        <ul className="instructionsContent">
          <li>A team can attempt only once.</li>
          <li>You will be given 1000 coins initially.</li>
          <li>
            There are 8 categories. You will choose a category and bet some
            amount of coins.
          </li>
          <li>In each round a player has to bet a minimum of 200 coins.</li>
          <li>
            After betting the coins, you will be shown a question which will
            have 4 options out of which only 1 will be correct.
          </li>
          <li>
            If the answer is right you will get the coins back after being
            multiplied by the multiplier.
          </li>
          <li>If the answer is wrong, the betted coins will be lost.</li>
          <li>
            After attempting one question from the chosen category, you will
            choose another category and then bet and so on till you complete all
            the categories.
          </li>
          <li>If you are out of the coins, your game will end.</li>
          <li>
            After attempting all the 8 categories, your final amount of coins
            will be stored and the top 12 teams according to the number of coins
            will proceed to the next round.
          </li>
          <li>
            Ties will be resolved on the basis of time taken to complete the
            game.
          </li>
          <li>
            The maximum number of you can bet in each round and its
            corresponding multiplier is as follows.
          </li>
          <img className="rules-img" src={rules} alt="RULES" />
        </ul>

        <div
          className="instructionsButton"
          onClick={() => {
            navigate("/categories");
          }}
        >
          Continue to Play
        </div>
      </div>
    </div>
  );
};

export default Instructions;
