import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/useDocument";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import useFetch from "../utils/useFetch";
import { useVerifyAuth } from "../utils/useAuth";

const Categories = () => {
    useVerifyAuth();
    useTitle("View Your Categories");

    const URL = useURL();
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();

    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const { data, loading, error } = await useFetch(
                `${URL.API_BASE}${URL.API_CATEGORY}`,
                "get",
                null,
                { Authorization: `Bearer ${user.token}` }
            );

            setLoading(loading);

            if (data) {
                const { answered_categories: done, all_categories: all } = data;

                const completed = done?.map(cat => cat.id) ?? [];
                const shown =
                    all?.filter(cat => !completed.includes(cat.id)) ?? [];

                if (shown.length === 0) {
                    setSuccessText(
                        "All categories completed! Redirecting you to finish.",
                        URL.FINISHED
                    );
                }

                setCategories(shown);
            }

            if (error) {
                setErrorText("Failed to fetch categories. Refresh the page.");
                console.error(error);
            }
        };

        fetchData();
    }, [URL.API_BASE, URL.API_CATEGORY, user.token]);

    const handleLocate = async cat => {
        try {
            await useFetch(
                `${URL.API_BASE}${URL.API_CATEGORY}`,
                "post",
                { category: cat.name },
                { Authorization: `Bearer ${user.token}` }
            );

            updateUser({ category: cat.id });

            setSuccessText(
                `Selected ${cat.name}. Redirecting you to the bet.`,
                URL.SELECT
            );
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
                {loading ? (
                    <div className="loading"> Loading categories.</div>
                ) : categories?.length > 0 ? (
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
                ) : (
                    <div className="loading">No categories available.</div>
                )}
            </div>
        </div>
    );
};

export default Categories;
