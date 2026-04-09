import React, { useCallback, useEffect, useRef, useState } from "react";
import "../styles/question.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import {
    getQuestion,
    postAnswer,
    getGameState,
    getActionableActiveBet
} from "../utils/useFetch";
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
    const submitLockRef = useRef(false);
    const timerExpiredDuringSubmissionRef = useRef(false);
    const suppressLocalTimeoutRedirectRef = useRef(false);

    const isSameQuestionId = useCallback((left, right) => {
        if (left === undefined || left === null) {
            return false;
        }

        if (right === undefined || right === null) {
            return false;
        }

        return String(left) === String(right);
    }, []);

    const syncUserFromActiveBet = useCallback(
        activeBet => {
            if (!activeBet?.level) {
                return null;
            }

            const nextUser = { level: activeBet.level };
            if (
                activeBet.categoryId !== undefined &&
                activeBet.categoryId !== null
            ) {
                nextUser.category = activeBet.categoryId;
            }

            updateUser(nextUser);
            return activeBet.level;
        },
        [updateUser]
    );

    const syncAndRedirectToCategories = useCallback(
        async message => {
            clearQuestionTimer();
            try {
                const gameState = await getGameState(user.token);
                if (gameState.data?.points !== undefined) {
                    updateUser({ points: gameState.data.points });
                }
                if (gameState.data?.game_timer) {
                    syncOverallTimerFromBackend(gameState.data.game_timer);
                }
            } catch {}
            immediateRedirect(URL.CATEGORIES, message, "error");
        },
        [
            user.token,
            updateUser,
            syncOverallTimerFromBackend,
            clearQuestionTimer,
            immediateRedirect,
            URL.CATEGORIES
        ]
    );

    const handleFetchError = useCallback(
        async err => {
            const detail = err?.response?.data?.detail || err?.message || "";

            if (detail === "no open bet found for this level") {
                clearQuestionTimer();
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
                clearQuestionTimer();
                immediateRedirect(URL.FINISHED, "Game timer expired.", "error");
            } else if (err?.response?.status === 409) {
                if (
                    detail.includes("overall") ||
                    detail.includes("game timer")
                ) {
                    clearQuestionTimer();
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
                clearQuestionTimer();
                immediateRedirect(
                    URL.CATEGORIES,
                    "Error fetching question.",
                    "error"
                );
            }
        },
        [
            clearQuestionTimer,
            immediateRedirect,
            syncAndRedirectToCategories,
            URL.CATEGORIES,
            URL.FINISHED
        ]
    );

    const syncAndFetchQuestion = useCallback(
        async levelOverride => {
            try {
                const gameState = await getGameState(user.token);
                const activeBet = getActionableActiveBet(gameState.data);
                const syncedLevel = syncUserFromActiveBet(activeBet);
                const activeLevel = levelOverride || syncedLevel || user.level;

                if (gameState.data?.points !== undefined) {
                    updateUser({ points: gameState.data.points });
                }
                if (gameState.data?.game_timer) {
                    syncOverallTimerFromBackend(gameState.data.game_timer);
                }
                if (gameState.data?.status === "timer_expired") {
                    clearQuestionTimer();
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                    return false;
                }

                if (!activeLevel) {
                    clearQuestionTimer();
                    immediateRedirect(
                        URL.CATEGORIES,
                        "No active bet found.",
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

                const nextUser = {};
                if (
                    data.category_id !== undefined &&
                    data.category_id !== null
                ) {
                    nextUser.category = data.category_id;
                }
                if (data.level || activeLevel) {
                    nextUser.level = data.level || activeLevel;
                }
                if (Object.keys(nextUser).length > 0) {
                    updateUser(nextUser);
                }

                timerExpiredDuringSubmissionRef.current = false;
                suppressLocalTimeoutRedirectRef.current = false;
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

                if (
                    parsedStored &&
                    !isSameQuestionId(parsedStored.questionId, question_id)
                ) {
                    clearQuestionTimer();
                    parsedStored = null;
                }

                if (
                    parsedStored &&
                    isSameQuestionId(parsedStored.questionId, question_id)
                ) {
                    if (hasExpiredQuestionTimer(question_id)) {
                        await syncAndRedirectToCategories(
                            "Time's up! Your bet was lost."
                        );
                        return false;
                    }
                    restoreQuestionTimer();
                } else {
                    const resolvedLevel = data.level || activeLevel;
                    const duration =
                        question_timer_remaining_seconds ??
                        question_timer_seconds ??
                        timerConfig[resolvedLevel] ??
                        300;
                    startQuestionTimer(question_id, resolvedLevel, duration);
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
            clearQuestionTimer,
            immediateRedirect,
            URL.CATEGORIES,
            URL.FINISHED,
            handleFetchError,
            syncUserFromActiveBet,
            isSameQuestionId,
            hasExpiredQuestionTimer,
            syncAndRedirectToCategories,
            restoreQuestionTimer,
            timerConfig,
            startQuestionTimer
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
                    clearQuestionTimer();
                    immediateRedirect(
                        URL.FINISHED,
                        "Game timer expired.",
                        "error"
                    );
                    return;
                }

                const activeBet = getActionableActiveBet(gameState.data);
                const activeLevel = syncUserFromActiveBet(activeBet);

                if (activeLevel) {
                    const recovered = await syncAndFetchQuestion(activeLevel);

                    if (recovered) {
                        setErrorText(
                            fallbackMessage ||
                                "We restored your active question. Please try again."
                        );
                    }
                    return;
                }

                clearQuestionTimer();
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
            clearQuestionTimer,
            immediateRedirect,
            URL.FINISHED,
            URL.CATEGORIES,
            syncUserFromActiveBet,
            syncAndFetchQuestion,
            setErrorText
        ]
    );

    useEffect(() => {
        syncAndFetchQuestion();
    }, [syncAndFetchQuestion]);

    useEffect(() => {
        if (questionRemainingTime !== 0 || questionTimer === null) {
            return;
        }

        if (submitting || submitLockRef.current) {
            timerExpiredDuringSubmissionRef.current = true;
            return;
        }

        if (suppressLocalTimeoutRedirectRef.current) {
            return;
        }

        if (localStorage.getItem(TIMER_EXPIRED_FLAG)) return;
        localStorage.setItem(TIMER_EXPIRED_FLAG, "true");
        syncAndRedirectToCategories("Time's up! Your bet was lost.");
    }, [
        questionRemainingTime,
        questionTimer,
        submitting,
        syncAndRedirectToCategories
    ]);

    const handleAnswer = async opt => {
        if (submitting || submitLockRef.current || !question.id) return;

        try {
            submitLockRef.current = true;
            setSubmitting(true);
            timerExpiredDuringSubmissionRef.current = false;
            suppressLocalTimeoutRedirectRef.current = false;

            const { data, error } = await postAnswer(
                question.id,
                opt.id,
                user.token
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
                    if (timerExpiredDuringSubmissionRef.current) {
                        suppressLocalTimeoutRedirectRef.current = true;
                    }
                    await recoverActiveQuestion(
                        "We restored your active question. Please try again."
                    );
                    return;
                }

                if (timerExpiredDuringSubmissionRef.current) {
                    suppressLocalTimeoutRedirectRef.current = true;
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
            if (timerExpiredDuringSubmissionRef.current) {
                suppressLocalTimeoutRedirectRef.current = true;
            }
            await recoverActiveQuestion(
                "Could not submit answer. We are resyncing your active question."
            );
            console.log(err);
        } finally {
            submitLockRef.current = false;
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
