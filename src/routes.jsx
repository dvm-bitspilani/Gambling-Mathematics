import React, { useState } from "react";
import {
    Routes as BRoutes,
    BrowserRouter as BRouter,
    Route as BRoute
} from "react-router-dom";
import GlobalContext from "./contexts/GlobalContext";

import App from "./App";
import Instructions from "./components/instructions";
import Select from "./components/select";
import Categories from "./components/categories";
import Question from "./components/question";
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
            <BRouter basename="/gamblingmaths">
                <BRoutes>
                    <BRoute path="/" element={<App />} />
                    <BRoute path="/instructions" element={<Instructions />} />
                    <BRoute path="/select" element={<Select />} />
                    <BRoute path="/categories" element={<Categories />} />
                    <BRoute path="/question" element={<Question />} />
                    <BRoute path="/finished" element={<Finished />} />
                    <BRoute path="*" element={<App />} />
                </BRoutes>
            </BRouter>
        </GlobalContext.Provider>
    );
};

export default Routes;
