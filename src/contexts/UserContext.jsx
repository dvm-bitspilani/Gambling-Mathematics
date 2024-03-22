import React, { createContext, useState, useEffect, useContext } from "react";

const initUser = {
    name: null,
    points: null,
    token: null,
    category: null
};

const UserContext = createContext();

export const useUser = () => {
    const { user, updateUser } = useContext(UserContext);
    return { user, updateUser };
};

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem("gm_user"));
        return storedUser || initUser;
    });

    useEffect(() => {
        localStorage.setItem("gm_user", JSON.stringify(user));
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
