import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import {
    getCategories,
    getGameConfig,
    getGameState,
    getActionableActiveBet
} from "../utils/useFetch";
import { useTimer } from "../contexts/TimerContext";

const Categories = () => {
    useVerifyAuth();
    useTitle("View Your Categories");
    const navigate = useNavigate();
    const location = useLocation();
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText, immediateRedirect } = useAlert();
    const {
        updateTimerConfig,
        restoreOverallTimer,
        startOverallTimer,
        overallTimer,
        setOverallDuration,
        syncOverallTimerFromBackend
    } = useTimer();
    const URL = useURL();

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [redirecting, setRedirecting] = useState(false);
    const redirectingRef = useRef(redirecting);
    const shouldRedirectRef = useRef(false);

    useEffect(() => {
        redirectingRef.current = redirecting;
    }, [redirecting]);

    const syncUserFromActiveBet = activeBet => {
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
    };

    const fetchData = async () => {
        shouldRedirectRef.current = false;
        setLoading(true);

        try {
            const [categoriesRes, configRes, gameStateRes] = await Promise.all([
                getCategories(user.token),
                getGameConfig(),
                getGameState(user.token).catch(e => ({
                    data: null,
                    error: e,
                    loading: false
                }))
            ]);

            const gameState = gameStateRes?.data;
            const activeBet = getActionableActiveBet(gameState);
            let categoriesComplete = false;

            if (categoriesRes.data) {
                if (!Array.isArray(categoriesRes.data)) {
                    setErrorText(
                        "Expected a categories list but received an invalid response. Refresh the page."
                    );
                    console.error(
                        "Unexpected categories response:",
                        categoriesRes.data
                    );
                    return;
                }

                const shown = categoriesRes.data;
                categoriesComplete =
                    shown.length === 0 ||
                    shown.every(
                        category =>
                            !category.remaining_questions ||
                            category.remaining_questions <= 0
                    );

                setCategories(shown);
            }

            if (categoriesRes.error) {
                setErrorText("Failed to fetch categories. Refresh the page.");
                console.error(categoriesRes.error);
            }

            if (configRes.data) {
                if (configRes.data.timer_durations) {
                    updateTimerConfig(configRes.data.timer_durations);
                }
                if (configRes.data.overall_timer_seconds) {
                    setOverallDuration(configRes.data.overall_timer_seconds);
                }
            }

            if (gameState?.game_timer) {
                syncOverallTimerFromBackend(gameState.game_timer);
            }

            if (gameState?.points !== undefined) {
                updateUser({ points: gameState.points });
            }

            if (gameState?.status === "timer_expired") {
                shouldRedirectRef.current = true;
                setRedirecting(true);
                setErrorText(
                    "Overall time expired. Redirecting to finish.",
                    URL.FINISHED
                );
                return;
            }

            // Clear stale state if backend reports no active bet but frontend has level set
            if (!activeBet?.level && user.level) {
                updateUser({ level: null, category: null });
            }

            if (activeBet?.level) {
                syncUserFromActiveBet(activeBet);
                shouldRedirectRef.current = true;
                setRedirecting(true);
                setSuccessText(
                    "You have an active bet. Redirecting to your question.",
                    URL.QUESTION
                );
                return;
            }

            if (categoriesComplete) {
                shouldRedirectRef.current = true;
                setRedirecting(true);
                setSuccessText(
                    "All categories completed! Redirecting you to finish.",
                    URL.FINISHED
                );
                return;
            }

            if (!gameState?.game_timer) {
                const restoreResult = restoreOverallTimer();
                if (restoreResult?.expired) {
                    shouldRedirectRef.current = true;
                    setRedirecting(true);
                    setErrorText(
                        "Overall time expired. Redirecting to finish.",
                        URL.FINISHED
                    );
                } else if (!restoreResult && !overallTimer) {
                    startOverallTimer();
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            if (!shouldRedirectRef.current) {
                setRedirecting(false);
            }
        }
    };

    useEffect(() => {
        setRedirecting(false);
        fetchData();
    }, [location.pathname, user.token]);

    useEffect(() => {
        return () => {
            setRedirecting(false);
        };
    }, []);

    useEffect(() => {
        if (user.points === 0) {
            setRedirecting(true);
            setErrorText(
                "You have run out of points. Redirecting you to finish.",
                URL.FINISHED
            );
        }
    }, [user.points, setErrorText, URL.FINISHED]);

    const handleLocate = async category => {
        if (redirectingRef.current) {
            return;
        }

        try {
            if (
                !category.remaining_questions ||
                category.remaining_questions <= 0
            ) {
                setErrorText(
                    "Cannot attempt more questions from this category — limit reached."
                );
                return;
            }

            setRedirecting(true);
            updateUser({ category: category.id });

            if (category.has_active_bet && category.active_bet_level) {
                updateUser({ level: category.active_bet_level });
                immediateRedirect(
                    URL.QUESTION,
                    `Active bet found in ${category.name}. Redirecting to question.`,
                    "success"
                );
            } else {
                immediateRedirect(
                    URL.SELECT,
                    `Selected ${category.name}. Redirecting you to the bet.`,
                    "success"
                );
            }
        } catch (err) {
            setRedirecting(false);
            setErrorText("Failed to find this category. Try again.");
            console.error(err);
        }
    };

    // JSX
    return (
        <div className="categories-wrapper">
            <div className="categories-header" style={{ marginBottom: "1rem" }}>
                <div className="instructionsButton" onClick={() => navigate(URL.INSTRUCTIONS)}>
                    ← Back
                </div>
                <div className="instructionsButton" onClick={() => window.location.reload()}>
                    ↻ Refresh
                </div>
            </div>
            <div className="title">GAMBLING MATHS</div>
            <div className="stash">
                <div className="stashTitle">Betting Stash</div>
                <div className="stashAmount">{user.points ?? "N/A"}</div>
            </div>
            <div className="content">
                {loading ? (
                    <div className="loading"> Loading categories.</div>
                ) : categories?.length > 0 ? (
                    <div className="categories">
                        {categories?.map(category => (
                            <div
                                key={category.id}
                                className={`category${redirecting || !category.remaining_questions || category.remaining_questions <= 0 ? " disabled" : ""}`}
                                onClick={
                                    redirecting
                                        ? undefined
                                        : category.remaining_questions > 0
                                          ? () => handleLocate(category)
                                          : undefined
                                }
                            >
                                <span className="category-name">
                                    {category.name}
                                </span>
                                <span className="category-count">
                                    {category.remaining_questions ?? 3}/3
                                    remaining
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="loading">No categories available.</div>
                )}
            </div>
        </div>
    );
};

export default Categories;
