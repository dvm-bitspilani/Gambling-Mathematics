import React, { createContext, useState, useEffect, useContext } from "react";
import Cookies from "js-cookie";

const initUser = { name: null, points: null, token: null, category: null };

const UserContext = createContext();

export const useUser = () => {
    const { user, updateUser } = useContext(UserContext);
    return { user, updateUser };
};

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = JSON.parse(Cookies.get("gm_user"));
        return storedUser || initUser;
    });

    useEffect(() => {
        Cookies.set("gm_user", JSON.stringify(user), { expires: 365 });
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
