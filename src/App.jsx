import React from "react";
import "./styles/login.css";
import { useUser } from "./contexts/UserContext";
import { useTitle } from "./utils/useHead";
import { useRedirect } from "./utils/useAuth";
import { useURL } from "./utils/useData";
import { useAlert } from "./contexts/AlertContext";
import { postLogin } from "./utils/useFetch";

const App = () => {
    // Hooks
    useRedirect();
    useTitle("Login");
    const { updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const URL = useURL();

    // Event Handlers
    const handleSubmit = async e => {
        e.preventDefault();
        const { username, password } = e.target.elements;

        if (!username.value || !password.value) {
            setErrorText("Login failed. Please fill all the fields.");
            return;
        }

        try {
            const { data, error } = await postLogin(
                username.value,
                password.value
            );

            if (error) {
                handleLoginError(error);
            } else {
                handleLoginSuccess(data);
            }
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

    // JSX
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
};

export default App;
