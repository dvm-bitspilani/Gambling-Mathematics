import React, { useContext } from "react";
import "../styles/login.css";
import UserContext from "../contexts/UserContext";
import { useTitle } from "../utils/useDocument";

const Finished = () => {
    useTitle("Game Finished");

    const { user } = useContext(UserContext);

    const finalPoints =
        user.points ?? JSON.parse(localStorage.user).points ?? "N/A";

    return (
        <div id="login-wrapper">
            <div id="left">
                <div id="login-head">GAMBLING MATHS</div>
                <div className="reg-par">
                    Your game has ended. We hope you enjoyed it!
                </div>
            </div>

            <div id="right">
                <div id="login-form">
                    <div className="login-field-cont">
                        <div className="login-field">
                            Your final points are: {finalPoints}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finished;
