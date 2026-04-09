import React, { useCallback, useEffect, useState } from "react";
import "../styles/question.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { getQuestion, postAnswer, getGameState } from "../utils/useFetch";
import { useTimer } from "../contexts/TimerContext";

const TIMER_EXPIRED_FLAG = "gambling_timer_expired_redirect";

const Question = () => {
    useVerifyAuth();
    useTitle("Answer Your Question");
    const { user, updateUser } = useUser();
    const { setErrorText, immediateRedirect } = useAlert();
    const URL = useURL();
    const IMAGE_BASE = "https://gambling-math.bits-apogee.org/";
    const {
        restoreQuestionTimer,
        hasExpiredQuestionTimer,
        clearQuestionTimer,
        timerConfig,
        questionTimer,
        questionRemainingTime,
        startQuestionTimer,
        syncOverallTimerFromBackend
    } = useTimer();

    const [question, setQuestion] = useState({
        text: "",
        image: "",
        options: [],
        id: null
    });
    const [submitting, setSubmitting] = useState(false);

    const syncAndRedirectToCategories = useCallback(
        async message => {
            try {
                const gameState = await getGameState(user.token);
                if (gameState.data?.points !== undefined) {
                    updateUser({ points: gameState.data.points });
                }
            } catch {}
            immediateRedirect(URL.CATEGORIES, message, "error");
        },
        [user.token, updateUser, immediateRedirect, URL.CATEGORIES]
    );

    const handleFetchError = useCallback(
        async err => {
            const detail = err?.response?.data?.detail || err?.message || "";

            if (detail === "no open bet found for this level") {
                immediateRedirect(
                    URL.CATEGORIES,
                    "No active bet found.",
                    "error"
                );
            } else if (
                detail === "question timer expired" ||
                detail === "bet lost due to timeout"
            ) {
                await syncAndRedirectToCategories(
                    "Time's up! Your bet was lost."
                );
            } else if (
                detail.includes("overall") ||
                detail.includes("game timer")
            ) {
                immediateRedirect(URL.FINISHED, "Game timer expired.", "error");
            } else if (err?.response?.status === 409) {
                if (
                    detail.includes("overall") ||
                    detail.includes("game timer")
                ) {
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                } else {
                    await syncAndRedirectToCategories(
                        "Time's up! Your bet was lost."
                    );
                }
            } else {
                immediateRedirect(
                    URL.CATEGORIES,
                    "Error fetching question.",
                    "error"
                );
            }
        },
        [
            immediateRedirect,
            syncAndRedirectToCategories,
            URL.CATEGORIES,
            URL.FINISHED
        ]
    );

    const syncAndFetchQuestion = useCallback(
        async levelOverride => {
            const activeLevel = levelOverride || user.level;
            try {
                const gameState = await getGameState(user.token);
                if (gameState.data?.points !== undefined) {
                    updateUser({ points: gameState.data.points });
                }
                if (gameState.data?.game_timer) {
                    syncOverallTimerFromBackend(gameState.data.game_timer);
                }
                if (gameState.data?.status === "timer_expired") {
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                    return false;
                }

                const { data, error } = await getQuestion(
                    user.token,
                    activeLevel
                );

                if (error) {
                    await handleFetchError(error);
                    return false;
                }

                const {
                    image,
                    text,
                    options,
                    question_id,
                    question_timer_seconds,
                    question_timer_remaining_seconds,
                    game_timer
                } = data;

                setQuestion({
                    image,
                    text,
                    options,
                    id: question_id
                });

                localStorage.removeItem(TIMER_EXPIRED_FLAG);

                if (game_timer) {
                    syncOverallTimerFromBackend(game_timer);
                }

                let parsedStored = null;
                try {
                    const stored = localStorage.getItem("questionTimer");
                    parsedStored = stored ? JSON.parse(stored) : null;
                } catch {
                    localStorage.removeItem("questionTimer");
                    parsedStored = null;
                }

                if (parsedStored && parsedStored.questionId !== question_id) {
                    clearQuestionTimer(parsedStored.questionId);
                }

                if (parsedStored && parsedStored.questionId === question_id) {
                    if (hasExpiredQuestionTimer(question_id)) {
                        clearQuestionTimer(question_id);
                        await syncAndRedirectToCategories(
                            "Time's up! Your bet was lost."
                        );
                        return false;
                    }
                    restoreQuestionTimer();
                } else {
                    const duration =
                        question_timer_remaining_seconds ||
                        question_timer_seconds ||
                        timerConfig[activeLevel] ||
                        300;
                    startQuestionTimer(question_id, activeLevel, duration);
                }

                if (activeLevel && activeLevel !== user.level) {
                    updateUser({ level: activeLevel });
                }

                return true;
            } catch (error) {
                await handleFetchError(error);
                console.log(error);
                return false;
            }
        },
        [
            user.token,
            user.level,
            updateUser,
            syncOverallTimerFromBackend,
            immediateRedirect,
            URL.FINISHED,
            handleFetchError,
            clearQuestionTimer,
            hasExpiredQuestionTimer,
            restoreQuestionTimer,
            timerConfig,
            startQuestionTimer,
            syncAndRedirectToCategories
        ]
    );

    const recoverActiveQuestion = useCallback(
        async fallbackMessage => {
            try {
                const gameState = await getGameState(user.token);

                if (gameState.data?.points !== undefined) {
                    updateUser({ points: gameState.data.points });
                }

                if (gameState.data?.game_timer) {
                    syncOverallTimerFromBackend(gameState.data.game_timer);
                }

                if (gameState.data?.status === "timer_expired") {
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                    return;
                }

                if (
                    gameState.data?.open_bets_count > 0 &&
                    gameState.data?.open_bet_levels?.length > 0
                ) {
                    const activeLevel = gameState.data.open_bet_levels[0];
                    const recovered = await syncAndFetchQuestion(activeLevel);

                    if (recovered) {
                        setErrorText(
                            fallbackMessage ||
                                "We restored your active question. Please try again."
                        );
                        return;
                    }
                }

                immediateRedirect(
                    URL.CATEGORIES,
                    "No active bet found.",
                    "error"
                );
            } catch (err) {
                setErrorText(
                    fallbackMessage ||
                        "Could not resync your active question. Please try again."
                );
                console.log(err);
            }
        },
        [
            user.token,
            updateUser,
            syncOverallTimerFromBackend,
            immediateRedirect,
            URL.FINISHED,
            URL.CATEGORIES,
            syncAndFetchQuestion,
            setErrorText
        ]
    );

    useEffect(() => {
        syncAndFetchQuestion();
    }, [syncAndFetchQuestion]);

    // Handle timer expiration redirect
    useEffect(() => {
        if (
            questionRemainingTime === 0 &&
            questionTimer !== null &&
            !submitting
        ) {
            if (localStorage.getItem(TIMER_EXPIRED_FLAG)) return;
            localStorage.setItem(TIMER_EXPIRED_FLAG, "true");
            clearQuestionTimer(question.id);
            syncAndRedirectToCategories("Time's up! Your bet was lost.");
        }
    }, [
        questionRemainingTime,
        questionTimer,
        clearQuestionTimer,
        immediateRedirect,
        URL.CATEGORIES,
        submitting,
        question.id
    ]);

    const handleAnswer = async opt => {
        if (submitting || !question.id) return;

        try {
            setSubmitting(true);
            const totalDuration = timerConfig[questionTimer?.level] || 300;
            const timeTaken = totalDuration - questionRemainingTime;

            const { data, error } = await postAnswer(
                question.id,
                opt.id,
                user.token,
                timeTaken
            );

            if (error) {
                const errorDetail =
                    error?.response?.data?.detail || error?.message || "";

                if (errorDetail === "already answered") {
                    const gameState = await getGameState(user.token);
                    if (gameState.data?.points !== undefined) {
                        updateUser({ points: gameState.data.points });
                    }
                    clearQuestionTimer(question.id);
                    immediateRedirect(
                        URL.CATEGORIES,
                        "Your answer was already recorded.",
                        "error"
                    );
                    return;
                }

                if (
                    error?.response?.status === 409 ||
                    errorDetail.includes("timer expired")
                ) {
                    clearQuestionTimer(question.id);
                    if (
                        errorDetail.includes("overall") ||
                        errorDetail.includes("game timer")
                    ) {
                        immediateRedirect(
                            URL.FINISHED,
                            "Game timer expired.",
                            "error"
                        );
                    } else {
                        await syncAndRedirectToCategories(
                            "Time's up! Your bet was lost."
                        );
                    }
                    return;
                }

                if (
                    errorDetail === "question timer not started" ||
                    errorDetail === "no open bet found"
                ) {
                    await recoverActiveQuestion(
                        "We restored your active question. Please try again."
                    );
                    return;
                }

                handleError(error);
                return;
            }

            clearQuestionTimer(question.id);
            updateUser({ points: data.total_points });

            if (data.game_timer) {
                syncOverallTimerFromBackend(data.game_timer);
            }

            if (data.game_status === "timer_expired") {
                immediateRedirect(
                    URL.FINISHED,
                    "Overall time expired.",
                    "error"
                );
                return;
            }

            if (data.correct) {
                immediateRedirect(
                    URL.CATEGORIES,
                    `Correct! You won ${data.payout} points.`,
                    "success"
                );
            } else {
                immediateRedirect(
                    URL.CATEGORIES,
                    "Wrong answer. Bet lost.",
                    "error"
                );
            }
        } catch (err) {
            await recoverActiveQuestion(
                "Could not submit answer. We are resyncing your active question."
            );
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleError = err => {
        setErrorText("Could not submit answer. Please try again.");
        console.log(err);
    };

    // JSX
    return (
        <div className="question-wrapper">
            <div id="question-head">
                GAMBLING MATHS
                <div className="stash">
                    <div className="stashTitle">Betting Stash</div>
                    <div className="stashAmount">{user.points ?? "N/A"}</div>
                </div>
            </div>
            <div id="left">
                <div className="reg-par" id="question">
                    {question?.image ? (
                        <img
                            src={
                                question.image?.startsWith("http")
                                    ? question.image
                                    : `${IMAGE_BASE}${question.image?.replace(/^\//, "")}`
                            }
                            alt="question"
                            className="ques-img"
                        />
                    ) : question?.text ? (
                        question.text
                    ) : (
                        "Fetching Question.."
                    )}
                </div>
                <div id="answers">
                    {question?.options?.map(opt => (
                        <div
                            key={opt.id}
                            id={opt.id}
                            className={`answer glass1${submitting ? " disabled" : ""}`}
                            onClick={
                                submitting ? undefined : () => handleAnswer(opt)
                            }
                        >
                            {opt.text}
                        </div>
                    )) ?? "Fetching Options.."}
                </div>
            </div>
        </div>
    );
};

export default Question;
