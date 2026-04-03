import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback
} from "react";
import Cookies from "js-cookie";
import { setupAuthCallbacks } from "../utils/useFetch";

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
            const storedRefresh = sessionStorage.getItem("gm_refresh");
            return storedUserCookie
                ? {
                      ...initUser,
                      ...JSON.parse(storedUserCookie),
                      refresh: storedRefresh || null
                  }
                : initUser;
        } catch (error) {
            console.error("Error retrieving user data.");
            return initUser;
        }
    });

    const updateUser = useCallback(newData => {
        setUser(prevUser => ({ ...prevUser, ...newData }));
    }, []);

    const logoutUser = useCallback(() => {
        Cookies.remove("gm_user");
        sessionStorage.removeItem("gm_refresh");
        setUser(initUser);
    }, []);

    useEffect(() => {
        setupAuthCallbacks(updateUser, logoutUser);
    }, [updateUser, logoutUser]);

    useEffect(() => {
        try {
            const { refresh, ...persistedUser } = user;
            Cookies.set("gm_user", JSON.stringify(persistedUser), {
                expires: 365,
                secure: true,
                sameSite: "Strict"
            });
            if (refresh) {
                sessionStorage.setItem("gm_refresh", refresh);
            } else {
                sessionStorage.removeItem("gm_refresh");
            }
        } catch (error) {
            console.error("Error setting user data.");
        }
    }, [user]);

    return (
        <UserContext.Provider value={{ user, updateUser, logoutUser }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
