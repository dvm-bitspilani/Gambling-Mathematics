import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useUser } from "../contexts/UserContext";
import "../styles/question.css";
import { useNavigate } from "react-router-dom";
import { useTitle } from "../utils/useDocument";
import { useURL } from "../utils/useData";

const Question = () => {
    useTitle("Answer Your Question");

    const URL = useURL();
    const navigate = useNavigate();

    const Ref = useRef(null);
    const { user, updateUser } = useUser();
    const [timer, setTimer] = useState("00:00:00");

    const [ques, setQues] = useState({ question: "", options: [], qid: null });

    const getTimeRemaining = e => {
        const total = Date.parse(e) - Date.parse(new Date());

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

    const startTimer = (t, e) => {
        let { total, hours, minutes, seconds } = getTimeRemaining(e);

        if (total <= 0) {
            axios({
                method: "POST",
                url: `${URL.API_BASE}${URL.API_ANSWER}`,
                headers: {
                    Authorization: `Bearer ${user.token}`
                },
                data: {
                    question_id: t
                }
            });

            clearInterval(Ref.current);
            cancel();
        } else {
            setTimer(
                (hours > 9 ? hours : "0" + hours) +
                    ":" +
                    (minutes > 9 ? minutes : "0" + minutes) +
                    ":" +
                    (seconds > 9 ? seconds : "0" + seconds)
            );
        }
    };

    const clearTimer = (t, e) => {
        setTimer("00:03:00");
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => startTimer(t, e), 1000);
        Ref.current = id;
    };

    const getDeadTime = () => {
        let deadline = new Date();
        deadline.setSeconds(deadline.getSeconds() + 180);
        return deadline;
    };

    const cancel = () => {
        clearInterval(Ref.current);

        setErrorText(
            "You could not pick the correct answer. Redirecting you back to categories."
        );
        setTimeout(() => navigate(URL.CATEGORIES), 1200);
    };

    useEffect(() => {
        axios({
            method: "GET",
            url: `${URL.API_BASE}${URL.API_GET_QUESTION}`,
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        })
            .then(res => {
                updateUser({ points: res.data.points });

                setQues({
                    question: res.data.question,
                    options: res.data.options,
                    qid: res.data.question_id
                });

                clearTimer(res.data.question_id, getDeadTime());
            })
            .catch(err => {
                setErrorText(
                    "You could not pick the correct answer. Redirecting you back to categories."
                );
                setTimeout(() => navigate(URL.CATEGORIES), 1200);
            });
    }, []);

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
                                onClick={() => {
                                    axios({
                                        method: "POST",
                                        url: `${URL.API_BASE}${URL.API_ANSWER}`,
                                        headers: {
                                            Authorization: `Bearer ${user.token}`
                                        },
                                        data: {
                                            question_id: ques.qid,
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
                                                    "You picked the correct answer. Redirecting you back to categories."
                                                );
                                                setTimeout(
                                                    () =>
                                                        navigate(
                                                            URL.CATEGORIES
                                                        ),
                                                    1200
                                                );
                                            } else if (
                                                res.data.status === "incorrect"
                                            ) {
                                                setErrorText(
                                                    "You could not pick the correct answer. Redirecting you back to categories."
                                                );
                                                setTimeout(
                                                    () =>
                                                        navigate(
                                                            URL.CATEGORIES
                                                        ),
                                                    1200
                                                );
                                            }

                                            clearInterval(Ref.current);
                                        })
                                        .catch(err => cancel());
                                }}
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
