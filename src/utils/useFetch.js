import axios from "axios";
import { useURL } from "./useData";

const useFetch = async (url, method, data, headers) => {
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

const useGet = async (endpoint, userToken, addLink) => {
    const URL = useURL();
    const apiURL =
        `${URL.API_BASE}${URL[endpoint]}` + (addLink ? `/${addLink}` : "");
    const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};

    return await useFetch(apiURL, "get", null, headers);
};

const usePost = async (endpoint, data, userToken, addLink) => {
    const URL = useURL();
    const apiURL =
        `${URL.API_BASE}${URL[endpoint]}` + (addLink ? `/${addLink}` : "");
    const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};

    return await useFetch(apiURL, "post", data, headers);
};

const postLogin = async (username, password) => {
    return await usePost("API_LOGIN", { username, password }, null, false);
};

const getCategories = async userToken => {
    return await useGet("API_CATEGORY", userToken);
};

const postCategory = async (category, userToken) => {
    return await usePost("API_CATEGORY", { category }, userToken);
};

const postBet = async (bet, userToken, userCategory) => {
    return await usePost("API_PLACE_BET", { bet }, userToken, userCategory);
};

const getQuestion = async (userToken, userLevel) => {
    return await useGet("API_GET_QUESTION", userToken, userLevel);
};

const postAnswer = async (question_id, option_id, userToken) => {
    return await usePost("API_ANSWER", { question_id, option_id }, userToken);
};

export {
    postLogin,
    getCategories,
    postCategory,
    postBet,
    getQuestion,
    postAnswer
};
