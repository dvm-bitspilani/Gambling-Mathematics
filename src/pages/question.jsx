import React, { useEffect, useState } from "react";
import "../styles/question.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { useTimer } from "../contexts/TimerContext";
import { getQuestion, postAnswer } from "../utils/useFetch";

const Question = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Answer Your Question");
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const { timer, startTimer, handleTimeout } = useTimer();
    const URL = useURL();

    // State
    const [question, setQuestion] = useState({ q: "", o: [], id: null });

    // Effects
    useEffect(() => {
        fetchData();
    }, []);

    // Fetch Data Function
    const fetchData = async () => {
        try {
            const { data, error } = await getQuestion();

            if (error) {
                handleFetchError();
                return;
            }

            const { points, question, options, question_id } = data;

            updateUser({ points });
            setQuestion({ q: question, o: options, id: question_id });

            startTimer(3, 0);
        } catch (error) {
            handleFetchError();
            console.log(error);
        }
    };

    // Handle Fetch Error Function
    const handleFetchError = () => {
        setErrorText(
            "An error occurred while fetching the question. Please try again."
        );
    };

    // Handle Answer Function
    const handleAnswer = async opt => {
        clearInterval(timer);

        try {
            const { data, error } = await postAnswer(
                question.id,
                opt.option_id
            );

            if (error) {
                handleError();
                return;
            }

            updateUser({ category: null, points: data.points });

            if (data.status === "correct") {
                setSuccessText(
                    "You picked the correct answer. Redirecting you back to categories.",
                    URL.CATEGORIES
                );
            } else if (data.status === "incorrect") {
                handleError();
            }
        } catch (err) {
            handleError();
            console.log(err);
        }
    };

    // Handle Error Function
    const handleError = () => {
        handleTimeout();
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
                    {question?.q ? (
                        <img
                            src={question.q}
                            alt={question.q}
                            className="ques-img"
                        />
                    ) : (
                        "Fetching Question.."
                    )}
                </div>
                <div id="answers">
                    {question?.o?.map(opt => (
                        <div
                            key={opt.option_id}
                            id={opt.option_id}
                            className="answer glass"
                            onClick={() => handleAnswer(opt)}
                        >
                            {opt.option_text}
                        </div>
                    )) ?? "Fetching Options.."}
                </div>
            </div>
            <div id="right">
                <div id="right-grid">
                    <div className="reg-par" style={{ textAlign: "center" }}>
                        Your Remaining Time:
                    </div>
                    <div className="num" id="timer">
                        {timer}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Question;
