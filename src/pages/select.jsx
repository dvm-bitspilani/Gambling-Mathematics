import React, { useEffect, useState } from "react";
import "../styles/select.css";
import { useTitle } from "../utils/useHead";
import { useLevels, useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { postBet } from "../utils/useFetch";
import { useUser } from "../contexts/UserContext";
import { useVerifyAuth } from "../utils/useAuth";

const Select = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Place Your Bet");
    const URL = useURL();
    const levels = useLevels();
    const levelMap = {
        E: "easy",
        M: "medium",
        H: "hard"
    };
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();

    // State
    const [bet, setBet] = useState(200);
    const [selectedLevel, setSelectedLevel] = useState("hard");

    // Effects
    useEffect(() => {
        updateUser({ level: selectedLevel });
    }, [selectedLevel]);

    // Event Handlers
    const handleBetSelection = async () => {
        try {
            if (!bet) {
                setErrorText(
                    "Please enter the number of points you want to bet."
                );
                return;
            }

            if (Number(bet) < 1) {
                setErrorText("Minimum bet is 1 point.");
                return;
            }

            if (!["easy", "medium", "hard"].includes(selectedLevel)) {
                setErrorText("Please select a level first.");
                return;
            }

            if (bet > user.points) {
                setErrorText(
                    "You do not have enough points to place this bet."
                );
                return;
            }

            const { data, error } = await postBet(
                { amount: Number(bet), level: selectedLevel },
                user.token,
                user.category
            );

            if (error) {
                handlePostBetError(error);
                return;
            }

            if (typeof data?.remaining_points === "number") {
                updateUser({ points: data.remaining_points });
            }

            setSuccessText(
                "Your bet has been placed successfully. You will be redirected to the questions page.",
                URL.QUESTION
            );
        } catch (err) {
            setErrorText("An error occurred while placing your bet.");
            console.error("Error placing bet:", err);
        }
    };

    const handlePostBetError = error => {
        const status = error?.response?.status;
        const detail =
            error?.response?.data?.detail ||
            error?.message ||
            "An error occurred while placing your bet.";

        if (status === 403) {
            setErrorText(
                "You have selected a different category. Redirecting you back to the category selection page.",
                URL.CATEGORIES
            );
        } else if (
            status === 400 &&
            detail === "open bet already exists for this category and level"
        ) {
            setErrorText(
                "You have already placed a bet. Redirecting you to the questions page.",
                URL.QUESTION
            );
        } else {
            setErrorText(detail);
        }
    };

    // JSX
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
                    <div className="level-selector">
                        <span>Select Level: </span>
                        {levels
                            .filter(({ level }) => Boolean(levelMap[level]))
                            .map(({ level, text }) => {
                                const mappedLevel = levelMap[level];
                                return (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(mappedLevel)}
                                className={
                                    selectedLevel === mappedLevel
                                        ? "selected"
                                        : ""
                                }
                            >
                                {text}
                            </button>
                                );
                            })}
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
