import React, { useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Instructions from "./Pages/instructions";
import Categories from "./Pages/categories";
import Question from "./Pages/question";
import GlobalContext from "./globalContext";
import Select from "./Pages/select";

const Routes = () => {
  const router = createBrowserRouter([
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
  ]);

  const [user, setUser] = useState({
    name: "",
    points: "",
    token: "",
    category: "",
  });

  return (
    <GlobalContext.Provider value={{ user, setUser }}>
      <RouterProvider router={router} />
    </GlobalContext.Provider>
  );
};

export default Routes;
