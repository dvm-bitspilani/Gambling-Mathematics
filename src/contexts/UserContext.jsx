import React, { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const initUser = { name: null, points: null, token: null, category: null };

const UserContext = createContext();

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserContextProvider");
    }
    return context;
};

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const storedUserCookie = Cookies.get("gm_user");
            return storedUserCookie ? JSON.parse(storedUserCookie) : initUser;
        } catch (error) {
            console.error("Error retrieving user from cookies:", error);
            return initUser;
        }
    });

    useEffect(() => {
        try {
            Cookies.set("gm_user", JSON.stringify(user), { expires: 365 });
        } catch (error) {
            console.error("Error setting user cookie:", error);
        }
    }, [user]);

    const updateUser = newData => {
        setUser(prevUser => ({ ...prevUser, ...newData }));
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
