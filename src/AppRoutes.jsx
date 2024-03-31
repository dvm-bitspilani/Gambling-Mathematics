import React from "react";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";

import App from "./App";
import Instructions from "./pages/instructions";
import Select from "./pages/select";
import Categories from "./pages/categories";
import Question from "./pages/question";
import Finished from "./pages/finished";
import { useURL } from "./utils/useData";
import Fixed from "./components/Fixed";
import Alert from "./components/Alert";
import AlertContextProvider from "./contexts/AlertContext";
import Leaderboard from "./pages/leaderboard";

const AppRoutes = () => {
    const URL = useURL();

    return (
        <Router basename={URL.HOME}>
            <AlertContextProvider>
                <Fixed />
                <Alert />

                <Routes>
                    <Route path={URL.BASE} element={<App />} />
                    <Route path={URL.INSTRUCTIONS} element={<Instructions />} />
                    <Route path={URL.SELECT} element={<Select />} />
                    <Route path={URL.CATEGORIES} element={<Categories />} />
                    <Route path={URL.QUESTION} element={<Question />} />
                    <Route path={URL.FINISHED} element={<Finished />} />
                    <Route path={URL.LEADERBOARD} element={<Leaderboard />} />
                    <Route path="*" element={<App />} />
                </Routes>
            </AlertContextProvider>
        </Router>
    );
};

export default AppRoutes;
