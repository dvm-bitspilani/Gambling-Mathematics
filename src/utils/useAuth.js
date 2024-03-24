import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import URL from "./urls";

const useVerifyAuth = (navLink = URL.LOGIN) => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.token) {
            navigate(navLink);
        }
    }, [user.token, navigate, navLink]);
};

const useAuthRedirect = (navLink = URL.INSTRUCTIONS) => {
    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user.token) {
            navigate(navLink);
        }
    }, [user.token, navigate, navLink]);
};

export { useVerifyAuth, useAuthRedirect };
