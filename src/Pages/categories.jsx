import axios from "axios";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import baseURL from "../baseURL";
import GlobalContext from "../globalContext";
import "../Styles/categories.css";

const Categories = () => {
  const { user, setUser } = useContext(GlobalContext);
  const [error, setError] = useState(false);

  const navigate = useNavigate();
  const [categories, setCategories] = useState({ all: [], completed: [] });

  const locate = (cat) => {
    axios({
      method: "post",
      url: `${baseURL.base}/gamblingmaths/category`,
      headers: { Authorization: `Bearer ${user.token}` },
      data: { category: cat.name },
    })
      .then((res) => setUser({ ...user, category: cat.id }))
      .catch((err) => setError(true));

    navigate(`/select`);
  };

  useEffect(() => {
    document.title = "Gambling Maths | View Your Categories";

    axios({
      method: "get",
      url: `${baseURL.base}/gamblingmaths/category`,
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    })
      .then((res) => {
        setCategories({
          all: res.data.all_categories,
          completed: res.data.completed_categories,
        });
      })
      .catch((err) => {
        setError(true);
      });
  }, []);

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
          <div className="stashAmount">{user.points ?? "N/A"}</div>
        </div>
      </div>

      <div className="content">
        <div className="categories">
          {categories.all
            .filter(
              (cat) =>
                !categories.completed.map((cat) => cat.id).includes(cat.id)
            )
            .map((cat) => {
              return (
                <div
                  id={cat.id}
                  onClick={() => locate(cat)}
                  className="category"
                >
                  {cat.name}
                </div>
              );
            })}
        </div>
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
    </div>
  );
};

export default Categories;
