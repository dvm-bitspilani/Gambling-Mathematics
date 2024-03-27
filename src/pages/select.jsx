import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/select.css";
import { useTitle } from "../utils/useDocument";
import { useURL } from "../utils/useData";
import useAlert from "../utils/useAlert";
import useFetch from "../utils/useFetch";
import { useUser } from "../contexts/UserContext";
import { useVerifyAuth } from "../utils/useAuth";

const Select = () => {
    useVerifyAuth();
    useTitle("Place Your Bet");

    const URL = useURL();
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();

    const [bet, setBet] = useState(200);

    const handleBetSelection = async () => {
        try {
            if (!bet) {
                setErrorText(
                    "Please enter the number of points you want to bet."
                );
                return;
            }

            const { data, error } = await useFetch(
                `${URL.API_BASE}${URL.API_PLACE_BET}/${user.category}`,
                "post",
                { bet: bet },
                { Authorization: `Bearer ${user.token}` }
            );

            if (error) {
                if (error.code === 403) {
                    setErrorText(
                        "You have selected a different category. Redirecting you back to the category selection page."
                    );
                    setTimeout(() => navigate(URL.CATEGORY), 1200);
                } else if (error.code === 406) {
                    setErrorText(
                        "You have already placed a bet. Redirecting you to the questions page."
                    );
                    setTimeout(() => navigate(URL.QUESTION), 1200);
                } else {
                    setErrorText(
                        "An error occurred while placing your bet. Please try again."
                    );
                }

                return;
            }

            updateUser({ points: data.points });

            setSuccessText(
                "Your bet has been placed successfully. You will be redirected to the questions page."
            );
            setTimeout(() => navigate("/question"), 1200);
        } catch (err) {
            setErrorText("An error occurred while placing your bet.");
            console.error("Error placing bet:", err);
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
                    <div className="stashAmount">{user.points ?? "N/A"}</div>
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
        </div>
    );
};

export default Select;
