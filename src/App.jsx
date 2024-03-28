import React from "react";
import "./styles/login.css";
import { useUser } from "./contexts/UserContext";
import { useTitle } from "./utils/useDocument";
import { useRedirect } from "./utils/useAuth";
import { useURL } from "./utils/useData";
import useFetch from "./utils/useFetch";
import { useAlert } from "./contexts/AlertContext";

function App() {
    useRedirect();
    useTitle("Login");

    const URL = useURL();
    const { updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();

    const handleSubmit = async e => {
        e.preventDefault();

        const { username, password } = e.target;

        if (!username.value || !password.value) {
            setErrorText("Login failed. Please fill all the fields.");
            return;
        }

        try {
            const { data, error } = await useFetch(
                `${URL.API_BASE}${URL.API_LOGIN}`,
                "post",
                { username: username.value, password: password.value }
            );

            if (error) handleLoginError(error);
            else handleLoginSuccess(data);
        } catch (err) {
            handleLoginError(err);
        }
    };

    const handleLoginSuccess = data => {
        const { message, name, points, token } = data;

        if (message === "login") {
            setSuccessText(
                "Login successful. Redirecting you to instructions.",
                URL.INSTRUCTIONS
            );
            updateUser({ name, points, token });
        } else {
            setErrorText("Login failed. Invalid credentials.");
        }
    };

    const handleLoginError = err => {
        setErrorText("Login failed. Please try again later.");
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
        </div>
    );
}

export default App;
