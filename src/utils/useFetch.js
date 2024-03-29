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

const useGet = async (endpoint, data) => {
    const URL = useURL();
    const { user } = useUser();

    const apiURL = `${URL.API_BASE}${URL[endpoint]}`;
    const headers = { Authorization: `Bearer ${user.token}` };

    return await useFetch(apiURL, "get", data, headers);
};

const usePost = async (endpoint, data, addLink = null, addToken = true) => {
    const URL = useURL();
    const { user } = useUser();

    const apiURL =
        `${URL.API_BASE}${URL[endpoint]}` + addLink ? `/${user[addLink]}` : ``;
    const headers = addToken ? { Authorization: `Bearer ${user.token}` } : {};

    return await useFetch(apiURL, "post", data, headers);
};

const postLogin = async (username, password) => {
    return await usePost("API_LOGIN", { username, password }, null, false);
};

const getCategories = async () => {
    return await useGet("API_CATEGORY", {});
};

const postCategory = async category => {
    return await usePost("API_CATEGORY", { category });
};

const postBet = async bet => {
    return await usePost("API_PLACE_BET", { bet }, "category");
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
