import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/useDocument";
import axios from "axios";
import Alert from "../components/Alert";
import { useURL } from "../utils/useData";

const Categories = () => {
    useTitle("View Your Categories");

    const URL = useURL();
    const navigate = useNavigate();
    const { user, updateUser } = useUser();

    const [error, setError] = useState({ status: false, message: "" });
    const [success, setSuccess] = useState({ status: false, message: "" });
    const [categories, setCategories] = useState({ all: [], shown: [] });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(
                    `${URL.API_BASE}${URL.API_CATEGORY}`,
                    {
                        headers: { Authorization: `Bearer ${user.token}` }
                    }
                );

                const { completed_categories: done, all_categories: all } =
                    res.data;

                const completed = done ? done.map(cat => cat.id) : [];

                const visible = all
                    ? all.filter(cat => !completed.includes(cat.id))
                    : [];

                if (visible.length === 0) {
                    setSuccess({
                        status: true,
                        message:
                            "All categories completed! Redirecting you to finish."
                    });

                    setTimeout(() => navigate(URL.FINISHED), 2000);
                } else {
                    setCategories({
                        all: all,
                        shown: visible
                    });
                }
            } catch (err) {
                setError({
                    status: true,
                    message: "Failed to fetch categories. Refresh the page."
                });
                console.error(err);
            }
        };

        fetchCategories();
    }, [user.token, URL.API_BASE, URL.API_CATEGORY, navigate]);

    const locateCategory = async cat => {
        try {
            await axios.post(
                `${URL.API_BASE}${URL.API_CATEGORY}`,
                { category: cat.name },
                {
                    headers: { Authorization: `Bearer ${user.token}` }
                }
            );

            updateUser({ category: cat.id });

            setSuccess({
                status: true,
                message: `Selected ${cat.name}. Redirecting you to the questions.`
            });

            setTimeout(() => navigate(URL.QUESTION), 600);
        } catch (err) {
            setError({
                status: true,
                message: "Failed to find this category. Try again."
            });
            console.error(err);
        }
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
                            onClick={() => locateCategory(cat)}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
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
};

export default Categories;
