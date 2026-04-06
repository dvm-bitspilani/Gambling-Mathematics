import React, { useEffect, useState } from "react";
import "../styles/question.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { getQuestion, postAnswer } from "../utils/useFetch";
import { useTimer } from "../contexts/TimerContext";
import { useNavigate } from "react-router-dom";

const Question = () => {
    useVerifyAuth();
    useTitle("Answer Your Question");
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
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
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
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

            const stored = localStorage.getItem("questionTimer");
            const parsedStored = stored ? JSON.parse(stored) : null;

            if (parsedStored && parsedStored.questionId !== question_id) {
                clearQuestionTimer(parsedStored.questionId);
            }

            if (parsedStored && parsedStored.questionId === question_id) {
                if (hasExpiredQuestionTimer(question_id)) {
                    clearQuestionTimer(question_id);
                    setErrorText(
                        "Time's up! Your timer expired. Redirecting to finished.",
                        URL.FINISHED
                    );
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

    const handleFetchError = err => {
        setErrorText(
            "An error occurred while fetching the question. Please try again."
        );
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
                handleError(error);
                return;
            }

            clearQuestionTimer(question.id);
            updateUser({ category: null, points: data.total_points });

            if (data.game_timer) {
                syncOverallTimerFromBackend(data.game_timer);
            }

            if (data.game_status === "timer_expired") {
                setErrorText(
                    "Overall time expired. Redirecting to finish.",
                    URL.FINISHED
                );
                return;
            }

            const redirectUrl = URL.CATEGORIES;

            if (data.correct) {
                const payoutMsg = data.payout
                    ? ` You won ${data.payout} points!`
                    : "";
                setSuccessText(
                    `Correct answer!${payoutMsg} Redirecting...`,
                    redirectUrl
                );
            } else {
                setErrorText(
                    "Wrong answer. Your bet was lost. Redirecting...",
                    redirectUrl,
                    "Wrong Answer"
                );
            }
        } catch (err) {
            handleError(err);
            console.log(err);
        } finally {
            setSubmitting(false);
        }
    };

    const handleError = err => {
        setErrorText(
            "You could not pick the correct answer. Redirecting you back to categories.",
            URL.CATEGORIES
        );
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
