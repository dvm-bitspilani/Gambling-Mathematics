import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import Instructions from "./components/instructions";
import Categories from "./components/categories";
import Question from "./components/question";
import GlobalContext from "./globalContext";
import Select from "./components/select";
import Finished from "./components/finished";

const Routes = () => {
    const [user, setUser] = useState({
        name: null,
        points: null,
        token: null,
        category: null
    });

    return (
        <GlobalContext.Provider value={{ user, setUser }}>
            <Router basename="/gamblingmaths">
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/instructions" element={<Instructions />} />
                    <Route path="/select" element={<Select />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/question" element={<Question />} />
                    <Route path="/finished" element={<Finished />} />
                    <Route path="*" element={<App />} />
                </Routes>
            </Router>
        </GlobalContext.Provider>
    );
};

export default Routes;
