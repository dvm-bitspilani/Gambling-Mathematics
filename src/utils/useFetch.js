import axios from "axios";
import { useURL } from "./useData";

const buildUrl = (endpoint, addLink) => {
    const URL = useURL();
    const baseUrl = `${URL.API_BASE}${URL[endpoint]}`;

    return addLink ? `${baseUrl}/${addLink}` : baseUrl;
};

const fetchData = async (url, method, data, headers) => {
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

const createRequest = async (
    endpoint,
    method,
    data,
    userToken,
    addLink = null
) => {
    const apiURL = buildUrl(endpoint, addLink);
    const headers = userToken ? { Authorization: `Bearer ${userToken}` } : {};

    return await fetchData(apiURL, method, data, headers);
};

const postLogin = async (username, password) => {
    return await createRequest("API_LOGIN", "post", { username, password });
};

const getCategories = async userToken => {
    return await createRequest("API_CATEGORY", "get", null, userToken);
};

const postCategory = async (category, userToken) => {
    return await createRequest("API_CATEGORY", "post", { category }, userToken);
};

const postBet = async (bet, userToken, userCategory) => {
    return await createRequest(
        "API_PLACE_BET",
        "post",
        { bet },
        userToken,
        userCategory
    );
};

const getQuestion = async (userToken, userLevel) => {
    return await createRequest(
        "API_GET_QUESTION",
        "get",
        null,
        userToken,
        userLevel
    );
};

const postAnswer = async (question_id, option_id, userToken) => {
    return await createRequest(
        "API_ANSWER",
        "post",
        { question_id, option_id },
        userToken
    );
};

const getLeaderboard = async userToken => {
    return await createRequest("API_LEADERBOARD", "get", null, userToken);
};

export {
    postLogin,
    getCategories,
    postCategory,
    postBet,
    getQuestion,
    postAnswer,
    getLeaderboard
};
