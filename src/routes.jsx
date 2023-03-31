import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Instructions from "./Pages/instructions";
import Categories from "./Pages/categories";
import Question from "./Pages/question";
import GlobalContext from "./globalContext";
import Select from "./Pages/select";
import Finsihed from "./Pages/finished";

const Routes = () => {
  const router = createBrowserRouter({
    basename: "/gamblingmaths",
    routes: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/instructions",
        element: <Instructions />,
      },
      {
        path: "/select",
        element: <Select />,
      },
      {
        path: "/categories",
        element: <Categories />,
      },
      {
        path: "/question",
        element: <Question />,
      },
      {
        path: "/finished",
        element: <Finsihed />,
      },
      {
        path: "*",
        element: <App />,
      },
    ],
  });

  const [user, setUser] = useState({
    name: null,
    points: null,
    token: null,
    category: null,
  });

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  );
};

export default Routes;
