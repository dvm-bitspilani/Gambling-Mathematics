import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <div className="instructionsContent">
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Commodi
            dignissimos quo repudiandae vel quas voluptatem numquam
            exercitationem ducimus asperiores consequuntur, fuga debitis veniam
            quis delectus eveniet neque non ea nostrum mollitia recusandae
            doloribus vitae. Consequuntur sed veritatis aperiam! Excepturi,
            sunt.
          </p>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Commodi
            dignissimos quo repudiandae vel quas voluptatem numquam
            exercitationem ducimus asperiores consequuntur, fuga debitis veniam
            quis delectus eveniet neque non ea nostrum mollitia recusandae
            doloribus vitae. Consequuntur sed veritatis aperiam! Excepturi,
            sunt.
          </p>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Commodi
            dignissimos quo repudiandae vel quas voluptatem numquam
            exercitationem ducimus asperiores consequuntur, fuga debitis veniam
            quis delectus eveniet neque non ea nostrum mollitia recusandae
            doloribus vitae. Consequuntur sed veritatis aperiam! Excepturi,
            sunt.
          </p>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Commodi
            dignissimos quo repudiandae vel quas voluptatem numquam
            exercitationem ducimus asperiores consequuntur, fuga debitis veniam
            quis delectus eveniet neque non ea nostrum mollitia recusandae
            doloribus vitae. Consequuntur sed veritatis aperiam! Excepturi,
            sunt.
          </p>
        </div>

        <div
          className="instructionsButton"
          onClick={() => {
            navigate("/gamblingmaths/categories");
            window.location.reload();
          }}
        >
          Continue to Play
        </div>
      </div>
    </div>
  );
};

export default Instructions;
