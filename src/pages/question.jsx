import React, { useEffect, useState } from "react";
import "../styles/question.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { getQuestion, postAnswer } from "../utils/useFetch";

const Question = () => {
    // Hooks
    useVerifyAuth();
    useTitle("Answer Your Question");
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const URL = useURL();

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
                handleFetchError();
                return;
            }

            const { image, text, options, question_id } = data;
            setQuestion({
                image,
                text,
                options,
                id: question_id
            });
        } catch (error) {
            handleFetchError();
            console.log(error);
        }
    };

    // Handlers
    const handleFetchError = () => {
        setErrorText(
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
                handleError();
                return;
            }

            updateUser({ category: null, points: data.total_points });

            if (data.correct) {
                setSuccessText(
                    "You picked the correct answer. Redirecting you back to categories.",
                    URL.CATEGORIES
                );
            } else {
                handleError();
            }
        } catch (err) {
            handleError();
            console.log(err);
        }
    };

    const handleError = () => {
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
                                    : `https://gambling-math.bits-apogee.org${question.image}`
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
        </div>
    );
};

export default Question;
