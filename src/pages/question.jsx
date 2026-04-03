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
import Fixed from "../components/Fixed";

const Question = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Answer Your Question");
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const URL = useURL();
    const IMAGE_BASE = import.meta.env.VITE_IMAGE_BASE_URL;
    const { restoreTimer, hasExpiredTimer, clearQuestionTimer } = useTimer();
    const navigate = useNavigate();

    // State
    const [question, setQuestion] = useState({
        text: "",
        image: "",
        options: [],
        id: null
    });

    // Effects
    useEffect(() => {
        fetchData();
    }, []);

    // Functions
    const fetchData = async () => {
        try {
            const { data, error } = await getQuestion(user.token, user.level);

            if (error) {
                handleFetchError(error);
                return;
            }

            const { image, text, options, question_id } = data;
            setQuestion({
                image,
                text,
                options,
                id: question_id
            });

            if (hasExpiredTimer(question_id)) {
                setErrorText(
                    "Time's up! Your timer expired. Redirecting to finished.",
                    URL.FINISHED
                );
                return;
            }

            restoreTimer();
        } catch (error) {
            handleFetchError(error);
            console.log(error);
        }
    };

    // Handlers
    const handleFetchError = err => {
        const detail = err?.response?.data?.detail;
        setErrorText(
            detail ||
                "An error occurred while fetching the question. Please try again."
        );
    };

    const handleAnswer = async opt => {
        try {
            const { data, error } = await postAnswer(
                question.id,
                opt.id,
                user.token
            );

            if (error) {
                handleError(error);
                return;
            }

            clearQuestionTimer(question.id);
            updateUser({ category: null, points: data.total_points });

            if (data.correct) {
                setSuccessText(
                    "You picked the correct answer. Redirecting you back to categories.",
                    URL.CATEGORIES
                );
            } else {
                setErrorText(
                    "You picked the wrong answer. Redirecting you back to categories.",
                    URL.CATEGORIES,
                    "Wrong Answer"
                );
            }
        } catch (err) {
            handleError(err);
            console.log(err);
        }
    };

    const handleError = err => {
        const detail = err?.response?.data?.detail;
        setErrorText(
            detail ||
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
                                    : `${IMAGE_BASE}${question.image}`
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
                            className="answer glass1"
                            onClick={() => handleAnswer(opt)}
                        >
                            {opt.text}
                        </div>
                    )) ?? "Fetching Options.."}
                </div>
            </div>
            <Fixed />
        </div>
    );
};

export default Question;
