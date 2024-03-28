import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import "../styles/question.css";
import { useTitle } from "../utils/useDocument";
import { useURL } from "../utils/useData";
import useFetch from "../utils/useFetch";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";

const Question = () => {
    useVerifyAuth();
    useTitle("Answer Your Question");

    const URL = useURL();

    const Ref = useRef(null);
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const [timer, setTimer] = useState("00:00:00");
    const [ques, setQues] = useState({ question: "", options: [], id: null });

    const getTimeRemaining = endTime => {
        const total = Date.parse(endTime) - Date.parse(new Date());
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total,
            hours,
            minutes,
            seconds
        };
    };

    const startTimer = endTime => {
        const id = setInterval(() => {
            const { total, hours, minutes, seconds } =
                getTimeRemaining(endTime);
            if (total <= 0) {
                clearInterval(id);
                handleTimeout();
            } else {
                setTimer(
                    (hours > 9 ? hours : "0" + hours) +
                        ":" +
                        (minutes > 9 ? minutes : "0" + minutes) +
                        ":" +
                        (seconds > 9 ? seconds : "0" + seconds)
                );
            }
        }, 1000);
        Ref.current = id;
    };

    const handleTimeout = () => {
        clearInterval(Ref.current);
        setErrorText(
            "You could not pick the correct answer. Redirecting you back to categories.",
            URL.CATEGORIES
        );
    };

    const fetchData = async () => {
        try {
            const { data, error } = await useFetch(
                `${URL.API_BASE}${URL.API_GET_QUESTION}`,
                "get",
                { level: user.level },
                { Authorization: `Bearer ${user.token}` }
            );

            if (error) {
                setErrorText(
                    "An error occurred while fetching the question. Please try again."
                );
                return;
            }

            const { points, question, options, question_id } = data;

            updateUser({ points });
            setQues({ question, options, id: question_id });

            startTimer(getDeadTime());
        } catch (error) {
            setErrorText(
                "An error occurred while fetching the question. Please try again."
            );
            console.log(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAnswer = async opt => {
        clearInterval(Ref.current);

        axios({
            method: "post",
            url: `${URL.API_BASE}${URL.API_ANSWER}`,
            headers: {
                Authorization: `Bearer ${user.token}`
            },
            data: {
                question_id: ques.id,
                option_id: opt.option_id
            }
        })
            .then(res => {
                updateUser({
                    category: null,
                    points: res.data.points
                });

                if (res.data.status === "correct") {
                    setSuccessText(
                        "You picked the correct answer. Redirecting you back to categories.",
                        URL.CATEGORIES
                    );
                } else if (res.data.status === "incorrect") {
                    setErrorText(
                        "You could not pick the correct answer. Redirecting you back to categories.",
                        URL.CATEGORIES
                    );
                }
            })
            .catch(err => handleTimeout());
    };

    const getDeadTime = () => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 180);
        return deadline;
    };

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
                    {ques?.question ? (
                        <img
                            src={ques.question}
                            alt={ques.question}
                            className="ques-img"
                        />
                    ) : (
                        "Fetching Question.."
                    )}
                </div>

                <div id="answers">
                    {ques?.options?.map(opt => {
                        return (
                            <div
                                key={opt.option_id}
                                id={opt.option_id}
                                className="answer glass"
                                onClick={() => handleAnswer(opt)}
                            >
                                {opt.option_text}
                            </div>
                        );
                    }) ?? "Fetching Options.."}
                </div>
            </div>

            <div id="right">
                <div id="right-grid">
                    <div className="reg-par">
                        Answer before the timer runs out
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
