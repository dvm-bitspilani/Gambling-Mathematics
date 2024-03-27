import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useURL } from "./useData";
import { useUser } from "../contexts/UserContext";

const useVerifyAuth = link => {
    const URL = useURL();
    link = link || URL.BASE;

    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user.token) {
            navigate(link);
        }
    }, [user.token, navigate, link]);
};

const useRedirect = link => {
    const URL = useURL();
    link = link || URL.INSTRUCTIONS;

    const { user } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (user.token) {
            navigate(link);
        }
    }, [user.token, navigate, link]);
};

export { useVerifyAuth, useRedirect };
