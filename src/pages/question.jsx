import React, { useEffect, useState } from "react";
import "../styles/question.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { getQuestion, postAnswer, getGameState } from "../utils/useFetch";
import { useTimer } from "../contexts/TimerContext";
import { useNavigate } from "react-router-dom";

const TIMER_EXPIRED_FLAG = 'gambling_timer_expired_redirect';

const Question = () => {
    useVerifyAuth();
    useTitle("Answer Your Question");
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText, immediateRedirect } = useAlert();
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
    const navigate = useNavigate();

    const [question, setQuestion] = useState({
        text: "",
        image: "",
        options: [],
        id: null
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const syncAndFetchQuestion = async () => {
            try {
                const gameState = await getGameState(user.token);
                if (gameState.data?.points !== undefined) {
                    updateUser({ points: gameState.data.points });
                }
                if (gameState.data?.game_timer) {
                    syncOverallTimerFromBackend(gameState.data.game_timer);
                }
                if (gameState.data?.status === "timer_expired") {
                    immediateRedirect(URL.FINISHED, "Game timer expired.", 'error');
                    return;
                }

                const { data, error } = await getQuestion(user.token, user.level);

                if (error) {
                    handleFetchError(error);
                    return;
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
                        syncAndRedirectToCategories("Time's up! Your bet was lost.");
                        return;
                    }
                    restoreQuestionTimer();
                } else {
                    const duration =
                        question_timer_remaining_seconds ||
                        question_timer_seconds ||
                        timerConfig[user.level] ||
                        300;
                    startQuestionTimer(question_id, user.level, duration);
                }
            } catch (error) {
                handleFetchError(error);
                console.log(error);
            }
        };
        syncAndFetchQuestion();
    }, [user.token, user.level]);

    // Handle timer expiration redirect
    useEffect(() => {
        if (questionRemainingTime === 0 && questionTimer !== null && !submitting) {
            if (localStorage.getItem(TIMER_EXPIRED_FLAG)) return;
            localStorage.setItem(TIMER_EXPIRED_FLAG, 'true');
            clearQuestionTimer(question.id);
            syncAndRedirectToCategories("Time's up! Your bet was lost.");
        }
    }, [questionRemainingTime, questionTimer, clearQuestionTimer, immediateRedirect, URL.CATEGORIES, submitting, question.id]);

    const handleFetchError = async err => {
        const detail = err?.response?.data?.detail || err?.message || "";
        
        if (detail === "no open bet found for this level") {
            immediateRedirect(URL.CATEGORIES, "No active bet found.", 'error');
        } else if (detail === "question timer expired" || detail === "bet lost due to timeout") {
            await syncAndRedirectToCategories("Time's up! Your bet was lost.");
        } else if (detail.includes("overall") || detail.includes("game timer")) {
            immediateRedirect(URL.FINISHED, "Game timer expired.", 'error');
        } else if (err?.response?.status === 409) {
            if (detail.includes("overall") || detail.includes("game timer")) {
                immediateRedirect(URL.FINISHED, "Game timer expired.", 'error');
            } else {
                await syncAndRedirectToCategories("Time's up! Your bet was lost.");
            }
        } else {
            immediateRedirect(URL.CATEGORIES, "Error fetching question.", 'error');
        }
    };

    const syncAndRedirectToCategories = async message => {
        try {
            const gameState = await getGameState(user.token);
            if (gameState.data?.points !== undefined) {
                updateUser({ points: gameState.data.points });
            }
        } catch {}
        immediateRedirect(URL.CATEGORIES, message, 'error');
    };

    const handleAnswer = async opt => {
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
                const errorDetail = error?.response?.data?.detail || error?.message || "";
                
                if (errorDetail === "already answered") {
                    const gameState = await getGameState(user.token);
                    if (gameState.data?.points !== undefined) {
                        updateUser({ points: gameState.data.points });
                    }
                    immediateRedirect(URL.CATEGORIES, "Your answer was already recorded.", 'error');
                    return;
                }
                
                if (error?.response?.status === 409 || errorDetail.includes("timer expired")) {
                    if (errorDetail.includes("overall") || errorDetail.includes("game timer")) {
                        immediateRedirect(URL.FINISHED, "Game timer expired.", 'error');
                    } else {
                        await syncAndRedirectToCategories("Time's up! Your bet was lost.");
                    }
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
                immediateRedirect(URL.FINISHED, "Overall time expired.", 'error');
                return;
            }

            if (data.correct) {
                immediateRedirect(URL.CATEGORIES, `Correct! You won ${data.payout} points.`, 'success');
            } else {
                immediateRedirect(URL.CATEGORIES, "Wrong answer. Bet lost.", 'error');
            }
        } catch (err) {
            handleError(err);
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleError = err => {
        immediateRedirect(URL.CATEGORIES, "Could not submit answer. Redirecting.", 'error');
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
                            onClick={submitting ? undefined : () => handleAnswer(opt)}
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
