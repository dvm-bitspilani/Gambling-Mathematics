import { useState } from "react";
import "./styles/login.css";
import URL from "./urls";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import { useTitle } from "./utils/UseTitle";
import Alert from "./components/Alert";

function App() {
    useTitle("Login");

    const navigate = useNavigate();
    const { updateUser } = useUser();

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = e => {
        e.preventDefault();

        if (!e || !e.target || !e.target.username || !e.target.password) {
            setError(true);
            return;
        }

        const { username, password } = e.target;

        axios({
            method: "POST",
            url: `${URL.API_BASE}${URL.API_LOGIN}`,
            data: { username: username.value, password: password.value }
        })
            .then(res => {
                const { message, name, points, token } = res.data;

                if (message === "login") {
                    setSuccess(true);
                    updateUser({ name, points, token });

                    setTimeout(() => navigate(URL.INSTRUCTIONS), 2000);
                } else setError(true);
            })
            .catch(err => {
                setError(true);
                console.error(err);
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

            <Alert
                isOpen={error}
                setIsOpen={setError}
                title="ERROR"
                message="An error occurred. Please try again."
            />

            <Alert
                isOpen={success}
                setIsOpen={setSuccess}
                title="SUCCESS"
                message="Login successful. Redirecting you to the game."
            />
        </div>
    );
}

export default App;
