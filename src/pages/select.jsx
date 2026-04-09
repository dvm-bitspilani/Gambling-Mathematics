import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/select.css";
import "../styles/categories.css";
import { useTitle } from "../utils/useHead";
import { useLevels, useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import {
    postBet,
    getGameState,
    getActionableActiveBet
} from "../utils/useFetch";
import { useUser } from "../contexts/UserContext";
import { useTimer } from "../contexts/TimerContext";
import { useVerifyAuth } from "../utils/useAuth";

const Select = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Place Your Bet");
    const navigate = useNavigate();
    const URL = useURL();
    const levels = useLevels();
    const levelMap = {
        E: "easy",
        M: "medium",
        H: "hard"
    };
    const { user, updateUser } = useUser();
    const { syncOverallTimerFromBackend } = useTimer();
    const { setErrorText, setSuccessText, immediateRedirect } = useAlert();

    // State
    const [bet, setBet] = useState(200);
    const [selectedLevel, setSelectedLevel] = useState("hard");
    const [submitting, setSubmitting] = useState(false);

    const syncUserFromActiveBet = useCallback(
        activeBet => {
            if (!activeBet?.level) {
                return false;
            }

            const nextUser = { level: activeBet.level };
            if (
                activeBet.categoryId !== undefined &&
                activeBet.categoryId !== null
            ) {
                nextUser.category = activeBet.categoryId;
            }

            updateUser(nextUser);
            return true;
        },
        [updateUser]
    );

    const syncActiveBetAndRedirect = useCallback(
        async message => {
            try {
                const { data } = await getGameState(user.token);

                if (data?.points !== undefined) {
                    updateUser({ points: data.points });
                }
                if (data?.game_timer) {
                    syncOverallTimerFromBackend(data.game_timer);
                }
                if (data?.status === "timer_expired") {
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                    return true;
                }

                const activeBet = getActionableActiveBet(data);
                if (syncUserFromActiveBet(activeBet)) {
                    immediateRedirect(URL.QUESTION, message, "error");
                    return true;
                }
            } catch (err) {
                console.error("Failed to sync active bet:", err);
            }

            return false;
        },
        [
            user.token,
            updateUser,
            syncOverallTimerFromBackend,
            immediateRedirect,
            syncUserFromActiveBet,
            URL.FINISHED,
            URL.QUESTION
        ]
    );

    // Effects
    useEffect(() => {
        updateUser({ level: selectedLevel });
    }, [selectedLevel]);

    useEffect(() => {
        const syncGameStateOnLoad = async () => {
            try {
                const { data } = await getGameState(user.token);
                if (data?.points !== undefined) {
                    updateUser({ points: data.points });
                }
                if (data?.game_timer) {
                    syncOverallTimerFromBackend(data.game_timer);
                }
                if (data?.status === "timer_expired") {
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                    return;
                }

                const activeBet = getActionableActiveBet(data);
                if (syncUserFromActiveBet(activeBet)) {
                    immediateRedirect(URL.QUESTION);
                }
            } catch (err) {
                console.error("Failed to sync game state:", err);
            }
        };
        syncGameStateOnLoad();
    }, [
        user.token,
        updateUser,
        syncOverallTimerFromBackend,
        immediateRedirect,
        URL.QUESTION
    ]);

    // Event Handlers
    const handleBetSelection = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

            if (!bet) {
                setErrorText(
                    "Please enter the number of points you want to bet."
                );
                return;
            }

            if (Number(bet) < 200) {
                setErrorText("Minimum bet is 200 points.");
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
                await handlePostBetError(error);
                return;
            }

            if (typeof data?.remaining_points === "number") {
                updateUser({ points: data.remaining_points });
            }

            if (data?.game_timer) {
                syncOverallTimerFromBackend(data.game_timer);
            }

            immediateRedirect(
                URL.QUESTION,
                "Bet placed successfully!",
                "success"
            );
        } catch (err) {
            setErrorText("An error occurred while placing your bet.");
            console.error("Error placing bet:", err);
        } finally {
            setSubmitting(false);
        }
    };

    const handlePostBetError = async error => {
        const status = error?.response?.status;
        const detail =
            error?.response?.data?.detail ||
            error?.message ||
            "An error occurred while placing your bet.";

        if (status === 409 && detail.includes("overall")) {
            setErrorText(
                "Game timer expired. Redirecting you to finish.",
                URL.FINISHED
            );
        } else if (status === 403) {
            setErrorText(
                "You have selected a different category. Redirecting you back to the category selection page.",
                URL.CATEGORIES
            );
        } else if (
            status === 400 &&
            (detail === "open bet already exists for this category and level" ||
                detail === "you already have an active bet")
        ) {
            const redirected = await syncActiveBetAndRedirect(
                "You already have an active bet. Redirecting you to the question page."
            );

            if (!redirected) {
                setErrorText(
                    "You already have an active bet. Redirecting you to the question page.",
                    URL.QUESTION
                );
            }
        } else {
            setErrorText(detail);
        }
    };

    // JSX
    return (
        <div className="select-wrapper">
            <div
                className="instructionsButton"
                onClick={() => navigate(URL.CATEGORIES)}
                style={{ marginBottom: "1rem" }}
            >
                ← Back
            </div>
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
                                min="200"
                                step="1"
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
                                        onClick={() =>
                                            setSelectedLevel(mappedLevel)
                                        }
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
                    <div
                        className={`btns${submitting ? " disabled" : ""}`}
                        onClick={submitting ? undefined : handleBetSelection}
                    >
                        {submitting ? "PLACING..." : "SELECT"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Select;
