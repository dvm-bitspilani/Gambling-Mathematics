import { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./Styles/login.css";
import { useNavigate } from "react-router-dom";
import GlobalContext from "./globalContext";
import baseURL from "./baseURL";

function App() {
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const { setUser } = useContext(GlobalContext);

    useEffect(() => {
        document.title = "Gambling Maths | Login";
    }, []);

    useEffect(() => {
        const dismissError = () => {
            if (error) setTimeout(() => setError(false), 1400);
        };
        const dismissSuccess = () => {
            if (success) {
                setTimeout(() => {
                    setSuccess(false);
                    navigate("/instructions");
                }, 1400);
            }
        };
        dismissError();
        dismissSuccess();
    }, [error, success, navigate]);

    const handleSubmit = e => {
        e.preventDefault();
        axios({
            method: "post",
            url: `${baseURL.BASE}/login`,
            data: {
                username: e.target.username.value,
                password: e.target.password.value
            }
        })
            .then(res => {
                if (res.data.message === "login") {
                    setSuccess(true);
                    setUser({
                        name: res.data.name,
                        points: res.data.points,
                        token: res.data.token,
                        category: null
                    });
                    localStorage.setItem(
                        "user",
                        JSON.stringify({
                            name: res.data.name,
                            points: res.data.points,
                            token: res.data.token,
                            category: null
                        })
                    );
                } else {
                    setError(true);
                }
            })
            .catch(() => {
                setError(true);
            });
    };

    return (
        <div id="login-wrapper">
            <div id="left">
                <div id="login-head">GAMBLING MATHS</div>
                <div className="reg-par">Login to continue</div>
            </div>

            <div id="right">
                <form id="login-form" onSubmit={handleSubmit}>
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

            <div id="err-cont" style={{ display: error ? "flex" : "none" }}>
                <div id="err" className="glass">
                    <div id="err-head">ERROR</div>
                    <div className="reg-par">
                        Your credentials could not be verified. Please try
                        again.
                    </div>
                </div>
            </div>

            <div id="succ-cont" style={{ display: success ? "flex" : "none" }}>
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
