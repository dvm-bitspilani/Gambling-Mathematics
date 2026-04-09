import React, {
    createContext,
    useState,
    useEffect,
    useContext,
    useCallback,
    useMemo
} from "react";
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

    const updateUser = useCallback(newData => {
        setUser(prevUser => ({ ...prevUser, ...newData }));
    }, []);

    const updateUserToken = useCallback(newToken => {
        setUser(prevUser => ({ ...prevUser, token: newToken }));
    }, []);

    const logoutUser = useCallback(() => {
        Cookies.remove("gm_user");
        localStorage.removeItem("overallTimer");
        localStorage.removeItem("overallTimerSeconds");
        localStorage.removeItem("questionTimer");
        localStorage.removeItem("timerConfig");
        localStorage.removeItem("gambling_timer_expired_redirect");
        setUser(initUser);
    }, []);

    useEffect(() => {
        const handleAuthExpired = () => {
            setUser(initUser);
        };

        window.addEventListener("gm:auth-expired", handleAuthExpired);
        return () => {
            window.removeEventListener("gm:auth-expired", handleAuthExpired);
        };
    }, []);

    useEffect(() => {
        try {
            Cookies.set("gm_user", JSON.stringify(user), {
                expires: 365
            });
        } catch (error) {
            console.error("Error setting user data.");
        }
    }, [user]);

    const contextValue = useMemo(
        () => ({ user, updateUser, updateUserToken, logoutUser }),
        [user, updateUser, updateUserToken, logoutUser]
    );

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
