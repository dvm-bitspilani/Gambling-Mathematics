import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { getCategories, getGameConfig } from "../utils/useFetch";
import { useTimer } from "../contexts/TimerContext";

const Categories = () => {
    useVerifyAuth();
    useTitle("View Your Categories");
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const {
        updateTimerConfig,
        restoreOverallTimer,
        startOverallTimer,
        overallTimer,
        setOverallDuration
    } = useTimer();
    const URL = useURL();

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (user.points === 0) {
            setErrorText(
                "You have run out of points. Redirecting you to finish.",
                URL.FINISHED
            );
        }
    }, [user.points]);

    const fetchData = async () => {
        try {
            const [categoriesRes, configRes] = await Promise.all([
                getCategories(user.token),
                getGameConfig()
            ]);

            setLoading(categoriesRes.loading);

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

                if (shown.length === 0) {
                    setSuccessText(
                        "All categories completed! Redirecting you to finish.",
                        URL.FINISHED
                    );
                }

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

            const restoreResult = restoreOverallTimer();
            if (restoreResult?.expired) {
                setErrorText(
                    "Overall time expired. Redirecting to finish.",
                    URL.FINISHED
                );
            } else if (!restoreResult && !overallTimer) {
                startOverallTimer();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLocate = async category => {
        try {
            updateUser({ category: category.id });

            if (category.has_active_bet && category.active_bet_level) {
                updateUser({ level: category.active_bet_level });
                setSuccessText(
                    `Active bet found in ${category.name}. Redirecting to question.`,
                    URL.QUESTION
                );
            } else {
                setSuccessText(
                    `Selected ${category.name}. Redirecting you to the bet.`,
                    URL.SELECT
                );
            }
        } catch (err) {
            setErrorText("Failed to find this category. Try again.");
            console.error(err);
        }
    };

    // JSX
    return (
        <div className="categories-wrapper">
            <div
                className="instructionsButton"
                onClick={() => navigate(URL.INSTRUCTIONS)}
                style={{ marginBottom: "1rem" }}
            >
                ← Back
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
                                className="category"
                                onClick={() => handleLocate(category)}
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
