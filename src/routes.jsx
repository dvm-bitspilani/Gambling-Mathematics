import React from "react";
import {
    Routes as BRoutes,
    BrowserRouter as BRouter,
    Route as BRoute
} from "react-router-dom";
import URL from "./urls";

import App from "./App";
import Instructions from "./pages/instructions";
import Select from "./pages/select";
import Categories from "./pages/categories";
import Question from "./pages/question";
import Finished from "./pages/finished";

const Routes = () => {
    return (
        <BRouter basename={URL.HOME}>
            <BRoutes>
                <BRoute path={URL.BASE} element={<App />} />
                <BRoute path={URL.INSTRUCTIONS} element={<Instructions />} />
                <BRoute path={URL.SELECT} element={<Select />} />
                <BRoute path={URL.CATEGORIES} element={<Categories />} />
                <BRoute path={URL.QUESTION} element={<Question />} />
                <BRoute path={URL.FINISHED} element={<Finished />} />
                <BRoute path="*" element={<App />} />
            </BRoutes>
        </BRouter>
    );
};

export default Routes;
