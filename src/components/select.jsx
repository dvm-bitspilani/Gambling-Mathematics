import axios from "axios";
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../globalContext";
import "../Styles/select.css";
import baseURL from "../baseURL";

const Select = () => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(GlobalContext);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [maxPoints, setMaxPoints] = useState(0);
    const [bet, setBet] = useState(200);

    useEffect(() => {
        document.title = "Gambling Maths | Place Your Bet";
        axios
            .get(`${baseURL.BASE}/get_max_bet`, {
                headers: {
                    Authorization: `Bearer ${
                        user.token ?? JSON.parse(localStorage.user).token
                    }`
                }
            })
            .then(res => {
                const POINTS = parseInt(res.data.max_bet);
                setMaxPoints(POINTS);

                if (POINTS < 200) {
                    setError(
                        "Your points are not enough to place more bets. Redirecting you to the results page."
                    );
                    setTimeout(() => navigate("/finished"), 600);
                }
            })
            .catch(err => {
                console.error("Error fetching max bet:", err);
                setError("An error occurred while fetching maximum bet.");
            });
    }, []);

    const handleBetSelection = () => {
        if (bet > maxPoints) {
            setError(
                `An error occurred while placing your bet. Please try again with a bet of ${maxPoints} points or less`
            );
        } else {
            axios
                .post(
                    `${baseURL.BASE}/place_bet/${user.category}`,
                    { bet: bet },
                    {
                        headers: {
                            Authorization: `Bearer ${
                                user.token ??
                                JSON.parse(localStorage.user).token
                            }`
                        }
                    }
                )
                .then(res => {
                    setUser({ ...user, points: res.data.points });
                    localStorage.setItem(
                        "user",
                        JSON.stringify({ ...user, points: res.data.points })
                    );
                    setSuccess(true);
                    setTimeout(() => navigate("/question"), 600);
                })
                .catch(err => {
                    if (err.response.status === 400) {
                        setError(
                            "An error occurred while placing your bet. Please try again with a bet of 200 points or more"
                        );
                    }
                    if (err.response.status === 403) {
                        setError(
                            "Current active category is not your selected category. Redirecting you to the categories."
                        );
                        setTimeout(() => navigate("/categories"), 600);
                    }
                });
        }
    };

    return (
        <div className="select-wrapper">
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <div className="title">GAMBLING MATHS</div>
                <div className="stash">
                    <div className="stashTitle">Betting Stash</div>
                    <div className="stashAmount">
                        {user.points ??
                            JSON.parse(localStorage.user).points ??
                            "N/A"}
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
                                onChange={e => setBet(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="desc">
                        Enter the number of points you want to bet. <br />
                    </div>
                </div>
                <div className="betSelect">
                    <div className="info">
                        Once you have selected the number of points you want to
                        bet, click on the button below to start the game.
                    </div>
                    <div className="btns" onClick={handleBetSelection}>
                        SELECT
                    </div>
                </div>
            </div>
            {error && (
                <div id="err-cont" style={{ display: "flex" }}>
                    <div id="err" className="glass">
                        <div id="err-head">ERROR</div>
                        <div className="reg-par">{error}</div>
                        <div
                            className="btns"
                            onClick={() => {
                                setError(null);
                                maxPoints < 200 && navigate("/finished");
                            }}
                        >
                            Continue
                        </div>
                    </div>
                </div>
            )}
            {success && (
                <div id="succ-cont" style={{ display: "flex" }}>
                    <div id="succ" className="glass">
                        <div id="succ-head">SUCCESS</div>
                        <div className="reg-par">
                            Your bet has been placed successfully. You will be
                            redirected to the questions page.
                        </div>
                        <div
                            className="btns"
                            onClick={() => {
                                navigate("/question");
                                setSuccess(false);
                            }}
                        >
                            Continue
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Select;
