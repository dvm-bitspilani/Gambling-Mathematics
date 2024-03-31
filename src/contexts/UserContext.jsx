import React, { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const initUser = {
    name: null,
    points: null,
    token: null,
    category: null,
    rank: null
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
            return storedUserCookie ? JSON.parse(storedUserCookie) : initUser;
        } catch (error) {
            console.error("Error retrieving user data.");
            return initUser;
        }
    });

    useEffect(() => {
        try {
            Cookies.set("gm_user", JSON.stringify(user), { expires: 365 });
        } catch (error) {
            console.error("Error setting user data.");
        }
    }, [user]);

    const updateUser = newData => {
        setUser(prevUser => ({ ...prevUser, ...newData }));
    };

    const logoutUser = () => {
        Cookies.remove("gm_user");
        setUser(initUser);
    };

    return (
        <UserContext.Provider value={{ user, updateUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
