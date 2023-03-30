import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import GlobalContext from "../globalContext";
import baseURL from "../baseURL";
import "../Styles/question.css";

const Question = () => {
  const { user, setUser } = useContext(GlobalContext);
  const [ques, setQues] = useState({});
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = "Gambling Maths | Answer Your Question";

    axios({
      method: "get",
      url: `${baseURL.base}/gamblingmaths/get_question`,
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => {
        setQues({
          question: res.data.question,
          options: res.data.options,
        });
      })
      .catch((err) => {
        setError(true);
      });
  }, []);

  return (
    <div className="question-wrapper">
      <div id="question-head">
        GAMBLING MATHS
        <div className="stash">
          <div className="stashTitle">Betting Stash</div>
          <div className="stashAmount">{user.role ?? "N/A"}</div>
        </div>
      </div>

      <div id="left">
        <div className="reg-par" id="question">
          {ques?.question ?? "Loading..."}
        </div>

        <div id="answers">
          {ques?.options?.map((opt) => {
            return <div className="answer glass">{opt}</div>;
          }) ?? "Loading..."}
        </div>
      </div>

      <div id="right">
        <div id="right-grid">
          <div className="reg-par">Answer before the timer runs out</div>
          <div className="num" id="timer">
            10:00
          </div>
          <div className="btn">SUBMIT</div>
        </div>
      </div>

      <div
        id="err-cont"
        style={error ? { display: "flex" } : { display: "none" }}
      >
        <div id="err" className="glass">
          <div id="err-head">ERROR</div>
          <div className="reg-par">
            An error occured while fetching the question. Please try again.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Question;
