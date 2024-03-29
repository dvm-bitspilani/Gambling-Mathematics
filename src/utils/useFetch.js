import axios from "axios";
import { useURL } from "./useData";
import { useUser } from "../contexts/UserContext";

const useFetch = async (url, method = "get", data, headers) => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers
        });

        return { data: response.data, error: null, loading: false };
    } catch (error) {
        return { data: null, error, loading: false };
    }
};

const useGet = async (endpoint, data, addToken = true, headers) => {
    const URL = useURL();
    const { user } = useUser();

    let finalUrl = `${URL.API_BASE}${URL[endpoint]}`;

    if (addToken) {
        headers = { ...headers, Authorization: `Bearer ${user.token}` };
    }

    return await useFetch(finalUrl, "get", data, headers);
};

const usePost = async (
    endpoint,
    data,
    addToken = true,
    headers,
    addLink = ""
) => {
    const URL = useURL();
    const { user } = useUser();

    let finalUrl = `${URL.API_BASE}${URL[endpoint]}`;

    if (addToken) {
        headers = { ...headers, Authorization: `Bearer ${user.token}` };
    }

    if (addLink !== "") {
        finalUrl += `/${user[addLink]}`;
    }

    return await useFetch(finalUrl, "post", data, headers);
};

const postLogin = async (username, password) => {
    return await usePost("API_LOGIN", { username, password }, false);
};

const getCategories = async () => {
    return await useGet("API_CATEGORY", {});
};

const postCategory = async category => {
    return await usePost("API_CATEGORY", { category });
};

const postBet = async bet => {
    return await usePost("API_PLACE_BET", { bet }, true, {}, "category");
};

const getQuestion = async () => {
    const { user } = useUser();
    return await useGet("API_GET_QUESTION", { level: user.level });
};

const postAnswer = async (question_id, option_id) => {
    return await usePost("API_ANSWER", { question_id, option_id });
};

export {
    postLogin,
    getCategories,
    postCategory,
    postBet,
    getQuestion,
    postAnswer
};
