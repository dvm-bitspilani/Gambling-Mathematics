import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/useDocument";
import { useURL } from "../utils/useData";
import useAlert from "../utils/useAlert";
import useFetch from "../utils/useFetch";
import { useVerifyAuth } from "../utils/useAuth";

const Categories = () => {
    useVerifyAuth();
    useTitle("View Your Categories");

    const URL = useURL();
    const navigate = useNavigate();
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const { data, error } = useFetch(
            `${URL.API_BASE}${URL.API_CATEGORY}`,
            "get",
            null,
            {
                Authorization: `Bearer ${user.token}`
            }
        );

        if (data) {
            const { answered_categories: done, all_categories: all } = data;

            const completed = done?.map(cat => cat.id) ?? [];
            const shown = all?.filter(cat => !completed.includes(cat.id)) ?? [];

            if (shown.length === 0) {
                setSuccessText(
                    "All categories completed! Redirecting you to finish."
                );
                setTimeout(() => navigate(URL.FINISHED), 600);
            }

            setCategories(shown);
        }

        if (error) {
            setErrorText("Failed to fetch categories. Refresh the page.");
            console.error(error);
        }
    }, [
        user.token,
        URL.API_BASE,
        URL.API_CATEGORY,
        navigate,
        setErrorText,
        setSuccessText
    ]);

    const handleLocate = async cat => {
        try {
            await axios.post(
                `${URL.API_BASE}${URL.API_CATEGORY}`,
                { category: cat.name },
                { headers: { Authorization: `Bearer ${user.token}` } }
            );

            updateUser({ category: cat.id });

            setSuccessText(
                `Selected ${cat.name}. Redirecting you to the questions.`
            );
            setTimeout(() => navigate(URL.QUESTION), 600);
        } catch (err) {
            setErrorText("Failed to find this category. Try again.");
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
                    {categories?.map(cat => (
                        <div
                            key={cat.id}
                            className="category"
                            onClick={() => handleLocate(cat)}
                        >
                            {cat.name}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Categories;
