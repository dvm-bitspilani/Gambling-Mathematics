import React from "react";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";

import App from "./App";
import Instructions from "./pages/instructions";
import Select from "./pages/select";
import Categories from "./pages/categories";
import Question from "./pages/question";
import Finished from "./pages/finished";
import { useURL } from "./utils/useData";

const AppRoutes = () => {
    const URL = useURL();

    return (
        <Router basename={URL.HOME}>
            <Routes>
                <Route path={URL.BASE} element={<App />} />
                <Route path={URL.INSTRUCTIONS} element={<Instructions />} />
                <Route path={URL.SELECT} element={<Select />} />
                <Route path={URL.CATEGORIES} element={<Categories />} />
                <Route path={URL.QUESTION} element={<Question />} />
                <Route path={URL.FINISHED} element={<Finished />} />
                <Route path="*" element={<App />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
