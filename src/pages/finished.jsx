import React from "react";
import "../styles/login.css";
import { useUser } from "../contexts/UserContext";
import { useTitle } from "../utils/useHead";

const Finished = () => {
    // Hooks
    useTitle("Game Finished");

    // Context
    const { user } = useUser();

    // Logic to retrieve final points
    const finalPoints = user.points ?? "N/A";

    // JSX
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
                            {`You finished at ${finalPoints} points.`}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Finished;
