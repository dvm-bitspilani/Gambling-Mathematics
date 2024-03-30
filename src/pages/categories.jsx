import React, { useEffect, useState } from "react";
import { useUser } from "../contexts/UserContext";
import "../styles/categories.css";
import { useTitle } from "../utils/useHead";
import { useURL } from "../utils/useData";
import { useAlert } from "../contexts/AlertContext";
import { useVerifyAuth } from "../utils/useAuth";
import { getCategories, postCategory } from "../utils/useFetch";

const Categories = () => {
    // Hooks
    useVerifyAuth();
    useTitle("View Your Categories");
    const { user, updateUser } = useUser();
    const { setErrorText, setSuccessText } = useAlert();
    const URL = useURL();

    // State
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);

    // Effects
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data, loading, error } = await getCategories(
                    user.token
                );

                setLoading(loading);

                if (data) {
                    const { answered_categories: done, all_categories: all } =
                        data;

                    const completed = done?.map(c => c.id) ?? [];
                    const shown =
                        all?.filter(c => !completed.includes(c.id)) ?? [];

                    if (shown.length === 0) {
                        setSuccessText(
                            "All categories completed! Redirecting you to finish.",
                            URL.FINISHED
                        );
                    }

                    setCategories(shown);
                }

                if (error) {
                    setErrorText(
                        "Failed to fetch categories. Refresh the page."
                    );
                    console.error(error);
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, [user.token]);

    // Handlers
    const handleLocate = async category => {
        try {
            await postCategory(category.name, user.token);

            updateUser({ category: category.id });

            setSuccessText(
                `Selected ${category.name}. Redirecting you to the bet.`,
                URL.SELECT
            );
        } catch (err) {
            setErrorText("Failed to find this category. Try again.");
            console.error(err);
        }
    };

    // JSX
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
                        {categories?.map(category => (
                            <div
                                key={category.id}
                                className="category"
                                onClick={() => handleLocate(category)}
                            >
                                {category.name}
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
