import { useContext, useEffect, useState } from "react";
import axios from "axios";
import baseURL from "./baseURL";
import "./Styles/login.css";
import { useNavigate } from "react-router-dom";
import GlobalContext from "./globalContext";

function App() {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const { user, setUser } = useContext(GlobalContext);

  useEffect(() => {
    document.title = "Gambling Maths | Login";
  }, []);

  useEffect(() => {
    if (error)
      setTimeout(() => {
        setError(false);
      }, 1400);
  }, [error]);

  useEffect(() => {
    if (success)
      setTimeout(() => {
        setSuccess(false);

        setTimeout(() => {
          navigate("/instructions");
          // window.location.reload();
        }, 1000);
      }, 1400);
  }, [success]);

  return (
    <div id="login-wrapper">
      <div id="left">
        <div id="login-head">GAMBLING MATHS</div>
        <div className="reg-par">Login to continue</div>
      </div>

      <div id="right">
        <form
          id="login-form"
          onSubmit={(e) => {
            e.preventDefault();

            axios({
              method: "post",
              url: `${baseURL.base}/gm_api/login`,
              data: {
                username: e.target.username.value,
                password: e.target.password.value,
              },
            })
              .then((res) => {
                if (res.data.message === "login") {
                  setSuccess(true);
                  setUser({
                    name: res.data.name,
                    points: res.data.points,
                    token: res.data.token,
                    category: null,
                    score: 0,
                  });

                  localStorage.setItem(
                    "user",
                    JSON.stringify({
                      name: res.data.name,
                      points: res.data.points,
                      token: res.data.token,
                      category: null,
                      score: 0,
                    })
                  );
                } else {
                  setError(true);
                }
              })
              .catch((err) => {
                setError(true);
              });
          }}
        >
          <div className="login-field-cont">
            <label htmlFor="username">Enter your username</label>
            <input
              type="text"
              className="login-field"
              id="username"
              name="username"
            />
          </div>

          <div className="login-field-cont">
            <label htmlFor="password">Enter your password</label>
            <input
              type="password"
              className="login-field"
              id="password"
              name="password"
            />
          </div>

          <button type="submit" className="btn">
            LOGIN
          </button>
        </form>
      </div>

      <div
        id="err-cont"
        style={error ? { display: "flex" } : { display: "none" }}
      >
        <div id="err" className="glass">
          <div id="err-head">ERROR</div>
          <div className="reg-par">
            Your credentials could not be verified. Please try again.
          </div>
        </div>
      </div>

      <div
        id="succ-cont"
        style={success ? { display: "flex" } : { display: "none" }}
      >
        <div id="succ" className="glass">
          <div id="succ-head">SUCCESS</div>
          <div className="reg-par">
            Login successful. You will be redirected to the game.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
