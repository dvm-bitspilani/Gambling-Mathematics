import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlobalContext from "../globalContext";
import "../Styles/categories.css";
import baseURL from "../baseURL";

const Categories = () => {
    const { user, setUser } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState({
        all: [],
        shown: []
    });

    useEffect(() => {
        document.title = "Gambling Maths | View Your Categories";

        const fetchData = async () => {
            try {
                const token = user.token ?? JSON.parse(localStorage.user).token;
                const response = await axios.get(`${baseURL()}/category`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const DATA = response.data;
                const completedIds = DATA.completed_categories.map(
                    cat => cat.id
                );

                const returnVal = DATA.all_categories.filter(
                    cat => !completedIds.includes(cat.id)
                );

                if (returnVal.length === 0) {
                    setSuccess(true);
                } else {
                    setCategories({
                        all: DATA.all_categories,
                        shown: returnVal
                    });
                }
            } catch (error) {
                setError(true);
            }
        };

        fetchData();
    }, [user.token]);

    useEffect(() => {
        if (success) {
            const delaySuccessMessage = setTimeout(() => {
                setSuccess(false);
                navigate("/finished");
            }, 2000);

            return () => clearTimeout(delaySuccessMessage);
        }
    }, [success, navigate]);

    const locate = async cat => {
        try {
            const token = user.token ?? JSON.parse(localStorage.user).token;
            const response = await axios.post(
                `${baseURL()}/category`,
                {
                    category: cat.name
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setUser({ ...user, category: cat.id });
            localStorage.setItem(
                "user",
                JSON.stringify({ ...user, category: cat.id })
            );

            navigate("/select");
        } catch (error) {
            setError(true);
        }
    };

    return (
        <div className="categories-wrapper">
            <div className="title">GAMBLING MATHS</div>
            <div className="stash">
                <div className="stashTitle">Betting Stash</div>
                <div className="stashAmount">
                    {user.points ??
                        JSON.parse(localStorage.user).points ??
                        "N/A"}
                </div>
            </div>
            <div className="content">
                <div className="categories">
                    {categories.shown.map(cat => (
                        <div
                            key={cat.id}
                            className="category"
                            onClick={() => locate(cat)}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
            </div>
            <div id="err-cont" style={{ display: error ? "flex" : "none" }}>
                <div id="err" className="glass">
                    <div id="err-head">ERROR</div>
                    <div className="reg-par">
                        An error occurred while fetching categories. Please try
                        again later.
                    </div>
                </div>
            </div>
            <div id="succ-cont" style={{ display: success ? "flex" : "none" }}>
                <div id="succ" className="glass">
                    <div id="succ-head">SUCCESS</div>
                    <div className="reg-par">
                        Congratulations! You have completed all the categories
                        and hence the game.
                    </div>
                    <div onClick={() => navigate("/question")} className="btns">
                        Continue
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Categories;
