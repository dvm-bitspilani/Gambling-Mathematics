import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import baseURL from "../baseURL";
import GlobalContext from "../globalContext";
import "../Styles/categories.css";

const Categories = () => {
  const { user, setUser } = useContext(GlobalContext);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const [categories, setCategories] = useState({
    all: [],
    completed: [],
    shown: [],
  });

  const locate = (cat) => {
    axios({
      method: "post",
      url: `${baseURL.base}/gm_api/category`,
      headers: {
        Authorization: `Bearer ${
          user.token ?? JSON.parse(localStorage.user).token
        }`,
      },
      data: { category: cat.name },
    })
      .then((res) => {
        setUser({ ...user, category: cat.id });

        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, category: cat.id })
        );
      })
      .catch((err) => setError(true));

    navigate("/select");
    
  };

  useEffect(() => {
    document.title = "Gambling Maths | View Your Categories";

    axios({
      method: "get",
      url: `${baseURL.base}/gm_api/category`,
      headers: {
        Authorization: `Bearer ${
          user.token ?? JSON.parse(localStorage.user).token
        }`,
      },
    })
      .then((res) => {
        const DATA = res.data;

        setCategories({
          all: DATA.all_categories,
          completed: DATA.completed_categories,
          shown: [],
        });

        const returnVal = DATA.all_categories.filter(
          (cat) =>
            !DATA.completed_categories.map((cat) => cat.id).includes(cat.id)
        );

        if (returnVal.length === 0) setSuccess(true);
        else
          setCategories({
            all: DATA.all_categories,
            completed: DATA.completed_categories,
            shown: returnVal.map((cat) => {
              return (
                <div
                  id={cat.id}
                  key={cat.id}
                  onClick={() => locate(cat)}
                  className="category"
                >
                  {cat.name}
                </div>
              );
            }),
          });
      })
      .catch((err) => setError(true));
  }, []);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        setSuccess(false);
      }, 1400);

      setTimeout(() => {
        navigate("/finished");
        
      }, 2000);
    }
  }, [success]);

  return (
    <div className="categories-wrapper">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="title">GAMBLING MATHS</div>

        <div className="stash">
          <div className="stashTitle">Betting Stash</div>
          <div className="stashAmount">
            {user.points ?? JSON.parse(localStorage.user).points ?? "N/A"}
          </div>
        </div>
      </div>

      <div className="content">
        <div className="categories">{categories.shown}</div>
      </div>

      <div
        id="err-cont"
        style={error ? { display: "flex" } : { display: "none" }}
      >
        <div id="err" className="glass">
          <div id="err-head">ERROR</div>
          <div className="reg-par">
            An error occured while fetching categories. Please try again later.
          </div>
        </div>
      </div>

      <div
        id="succ-cont"
        style={success ? { display: "flex" } : { display: "none" }}
      >
        <div id="succ" className="glass">
          <div id="succ-head">SUCCESS</div>
          <div className="reg-par">
            Congratulations! You have completed all the categories and hence the
            game.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
