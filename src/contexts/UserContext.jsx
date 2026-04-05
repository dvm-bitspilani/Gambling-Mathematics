import React, { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const initUser = {
    name: null,
    points: null,
    token: null,
    refresh: null,
    category: null,
    rank: null,
    level: null
};

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);

    if (!context) {
        throw new Error(
            "User context must be used within a UserContextProvider"
        );
    }

    return context;
};

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUserCookie = Cookies.get("gm_user");
            return storedUserCookie
                ? {
                      ...initUser,
                      ...JSON.parse(storedUserCookie)
                  }
                : initUser;
        } catch (error) {
            console.error("Error retrieving user data.");
            return initUser;
        }
    });

    const updateUser = newData => {
        setUser(prevUser => ({ ...prevUser, ...newData }));
    };

    const updateUserToken = newToken => {
        setUser(prevUser => ({ ...prevUser, token: newToken }));
    };

    const logoutUser = () => {
        Cookies.remove("gm_user");
        localStorage.removeItem("questionTimer");
        localStorage.removeItem("timerConfig");
        setUser(initUser);
    };

    useEffect(() => {
        try {
            Cookies.set("gm_user", JSON.stringify(user), {
                expires: 365
            });
        } catch (error) {
            console.error("Error setting user data.");
        }
    }, [user]);

    return (
        <UserContext.Provider
            value={{ user, updateUser, updateUserToken, logoutUser }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
