import axios from "axios";
import React, { useState, useContext, useEffect } from "react";
import GlobalContext from "../globalContext";
import baseURL from "../baseURL";
import "../Styles/select.css";
import { useNavigate } from "react-router-dom";

const Select = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(GlobalContext);

  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [maxPoints, setMaxPoints] = useState(0);
  const [bet, setBet] = useState(200);

  useEffect(() => {
    document.title = "Gambling Maths | Place Your Bet";

    axios({
      method: "get",
      url: `${baseURL.base}/gm_api/get_max_bet`,
      headers: {
        Authorization: `Bearer ${
          user.token ?? JSON.parse(localStorage.user).token
        }`,
      },
    }).then((res) => {
      const POINTS = parseInt(res.data.max_bet);
      console.log(POINTS);

      setMaxPoints(POINTS);
      if (POINTS < 200) {
        setTimeout(() => {
          navigate("/finished");
          window.location.reload();
        }, 1400);
      }
    });
  }, []);

  useEffect(() => {
    if (error)
      setTimeout(() => {
        setError(false);
      }, 2000);
  }, [error]);

  useEffect(() => {
    if (success)
      setTimeout(() => {
        setSuccess(false);

        setTimeout(() => {
          navigate("/question");
          window.location.reload();
        }, 1000);
      }, 2000);
  }, [success]);

  return (
    <div className="select-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="title">GAMBLING MATHS</div>

        <div className="stash">
          <div className="stashTitle">Betting Stash</div>
          <div className="stashAmount">
            {user.points ?? JSON.parse(localStorage.user).points ?? "N/A"}
          </div>
        </div>
      </div>

      <div className="content">
        <div className="betNumber">
          <div className="sliderHere">
            <div className="slidecontainer">
              <input
                type="number"
                className="input-field"
                id="myRange"
                value={bet}
                onChange={(e) => setBet(e.target.value)}
              />
            </div>
          </div>

          <div className="desc">
            Enter the number of points you want to bet. <br />
          </div>
        </div>

        <div className="betSelect">
          <div className="info">
            Once you have selected the number of points you want to bet, click
            on the button below to start the game.
          </div>

          <div
            onClick={() => {
              axios({
                method: "post",
                url: `${baseURL.base}/gm_api/place_bet/${user.category}`,
                headers: {
                  Authorization: `Bearer ${
                    user.token ?? JSON.parse(localStorage.user).token
                  }`,
                },
                data: {
                  bet: bet,
                },
              })
                .then((res) => {
                  setSuccess(true);
                  setUser({ ...user, points: res.data.points });

                  localStorage.setItem(
                    "user",
                    JSON.stringify({ ...user, points: res.data.points })
                  );
                })
                .catch((err) => {
                  setError(true);
                });
            }}
            className="btns"
          >
            SELECT
          </div>
        </div>
      </div>

      <div
        id="err-cont"
        style={error ? { display: "flex" } : { display: "none" }}
      >
        <div id="err" className="glass">
          <div id="err-head">ERROR</div>
          <div className="reg-par">
            An error occured while placing your bet. Please try again with a bet
            of{" "}
            {maxPoints ? `${maxPoints} points or less` : "200 points or more"}.
          </div>
        </div>
      </div>

      <div
        id="succ-cont"
        style={success ? { display: "flex" } : { display: "none" }}
      >
        <div id="succ" className="glass">
          <div id="succ-head">SUCCESS</div>
          <div className="reg-par">
            Your bet has been placed successfully. You will be redirected to the
            questions page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Select;
