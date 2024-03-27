import React, { useState } from "react";
import "./styles/login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import { useTitle } from "./utils/useDocument";
import Alert from "./components/Alert";
import { useRedirect } from "./utils/useAuth";
import { useURL } from "./utils/useData";

function App() {
    useRedirect();
    useTitle("Login");

    const URL = useURL();
    const navigate = useNavigate();
    const { updateUser } = useUser();

    const [error, setError] = useState({ status: false, message: "" });
    const [success, setSuccess] = useState({ status: false, message: "" });

    const handleSubmit = async e => {
        e.preventDefault();

        const { username, password } = e.target;

        if (!username.value || !password.value) {
            setError({
                status: true,
                message: "Login failed. Please fill all the fields."
            });
            return;
        }

        try {
            const res = await axios.post(`${URL.API_BASE}${URL.API_LOGIN}`, {
                username: username.value,
                password: password.value
            });
            handleLoginSuccess(res.data);
        } catch (err) {
            handleLoginError(err);
        }
    };

    const handleLoginSuccess = data => {
        const { message, name, points, token } = data;

        if (message === "login") {
            setSuccess({
                status: true,
                message: "Login successful. Redirecting you to instructions."
            });
            updateUser({ name, points, token });

            setTimeout(() => navigate(URL.INSTRUCTIONS), 2000);
        } else {
            setError({
                status: true,
                message: "Login failed. Invalid credentials."
            });
        }
    };

    const handleLoginError = err => {
        setError({
            status: true,
            message: "Login failed. Please try again later."
        });
        console.error(err);
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
                isOpen={error.status}
                setIsOpen={value => setError({ status: value, message: "" })}
                title="ERROR"
                message={error.message}
            />

            <Alert
                isOpen={success.status}
                setIsOpen={value => setSuccess({ status: value, message: "" })}
                title="SUCCESS"
                message={success.message}
            />
        </div>
    );
}

export default App;
