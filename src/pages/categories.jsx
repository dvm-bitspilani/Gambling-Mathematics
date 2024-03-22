import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/UseTitle";
import URL from "../urls";
import axios from "axios";
import Alert from "../components/Alert";

const Categories = () => {
    useTitle("View Your Categories");

    const navigate = useNavigate();
    const { user, updateUser } = useUser();

    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const [categories, setCategories] = useState({ all: [], shown: [] });

    useEffect(() => {
        axios({
            method: "GET",
            url: `${URL.API_BASE}${URL.CATEGORY}`,
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                const { completed_categories, all_categories } = res.data;

                const completed_ids = completed_categories.map(cat => cat.id);

                const return_value = all_categories.filter(
                    cat => !completed_ids.includes(cat.id)
                );

                if (return_value.length === 0) {
                    setSuccess(true);

                    setTimeout(() => navigate(URL.FINISHED), 2000);
                } else {
                    setCategories({
                        all: res.data.all_categories,
                        shown: return_value
                    });
                }
            })
            .catch(err => {
                setError(true);
                console.error(err);
            });
    }, [user.token]);

    const locate = async cat => {
        await axios({
            method: "POST",
            url: `${URL.BASE}${URL.CATEGORY}`,
            data: { category: cat.name },
            headers: { Authorization: `Bearer ${user.token}` }
        })
            .then(res => {
                console.log(res);
            })
            .catch(err => {
                setError(true);
                console.error(err);
            });

        updateUser({ category: cat.id });
        navigate(URL.SELECT);
    };

    return (
        <div className="categories-wrapper">
            <div className="title">GAMBLING MATHS</div>
            <div className="stash">
                <div className="stashTitle">Betting Stash</div>
                <div className="stashAmount">{user.points ?? "N/A"}</div>
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
            <Alert
                isOpen={error}
                setIsOpen={setError}
                title="ERROR"
                message="An error occurred while fetching categories. Please try again later."
            />
            <Alert
                isOpen={success}
                setIsOpen={setSuccess}
                title="SUCCESS"
                message="Congratulations! You have completed all the categories and hence the game."
                buttonText="Continue"
                onClick={() => navigate("/question")}
            />
        </div>
    );
};

export default Categories;
