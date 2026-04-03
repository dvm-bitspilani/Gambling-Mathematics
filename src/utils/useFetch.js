import axios from "axios";
import Cookies from "js-cookie";
import { useURL } from "./useData";

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const REFRESH_THRESHOLD_MS = 55 * 60 * 1000;

let updateUserCallback = null;
let logoutUserCallback = null;
let refreshTimeoutId = null;
let isRefreshing = false;
let refreshPromise = null;
let failedQueue = [];

export const setupAuthCallbacks = (updateUser, logoutUser) => {
    updateUserCallback = updateUser;
    logoutUserCallback = logoutUser;
    scheduleProactiveRefresh();
};

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const getStoredTokens = () => {
    try {
        const userCookie = Cookies.get("gm_user");
        const refreshToken = sessionStorage.getItem("gm_refresh");

        let accessToken = null;
        if (userCookie) {
            const user = JSON.parse(userCookie);
            accessToken = user.token;
        }

        return { accessToken, refreshToken };
    } catch {
        return { accessToken: null, refreshToken: null };
    }
};

const updateStoredTokens = (accessToken, refreshToken) => {
    try {
        const userCookie = Cookies.get("gm_user");
        if (userCookie) {
            const user = JSON.parse(userCookie);
            user.token = accessToken;
            Cookies.set("gm_user", JSON.stringify(user), { expires: 365 });
        }
        if (refreshToken) {
            sessionStorage.setItem("gm_refresh", refreshToken);
        }
        return true;
    } catch {
        return false;
    }
};

const scheduleProactiveRefresh = () => {
    if (refreshTimeoutId) {
        clearTimeout(refreshTimeoutId);
        refreshTimeoutId = null;
    }

    const tokens = getStoredTokens();
    if (!tokens.accessToken || !tokens.refreshToken) {
        return;
    }

    refreshTimeoutId = setTimeout(async () => {
        try {
            await refreshAccessToken();
        } catch (error) {
            console.error("Proactive refresh failed:", error);
        }
    }, REFRESH_THRESHOLD_MS);
};

const refreshAccessToken = async () => {
    if (isRefreshing && refreshPromise) {
        return refreshPromise;
    }

    const { refreshToken } = getStoredTokens();

    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    isRefreshing = true;

    refreshPromise = axios
        .post(`${API_BASE}/token/refresh/`, { refresh: refreshToken })
        .then(response => {
            const { access, refresh } = response.data;

            updateStoredTokens(access, refresh);

            if (updateUserCallback) {
                updateUserCallback({ token: access, refresh });
            }

            scheduleProactiveRefresh();

            processQueue(null, access);

            return { access, refresh };
        })
        .catch(error => {
            processQueue(error, null);

            if (logoutUserCallback) {
                logoutUserCallback();
            }
            window.location.href = "/gamblingmaths/";
            throw error;
        })
        .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
        });

    return refreshPromise;
};

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use(
    config => {
        const tokens = getStoredTokens();
        if (
            tokens.accessToken &&
            !config.url?.includes("/login") &&
            !config.url?.includes("/token/refresh/")
        ) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
    },
    error => Promise.reject(error)
);

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (
                originalRequest.url?.includes("/login") ||
                originalRequest.url?.includes("/token/refresh/")
            ) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return api(originalRequest);
                    })
                    .catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;

            try {
                const result = await refreshAccessToken();
                originalRequest.headers.Authorization = `Bearer ${result.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const buildUrl = (endpoint, addLink) => {
    const URL = useURL();
    const baseUrl = `${URL.API_BASE}${URL[endpoint]}`;

    return addLink ? `${baseUrl}/${addLink}` : baseUrl;
};

const fetchData = async (url, method, data, headers) => {
    try {
        const response = await api({
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

const postBet = async (bet, userToken, userCategory) => {
    return await createRequest(
        "API_PLACE_BET",
        "post",
        bet,
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

const getGameConfig = async () => {
    return await createRequest("API_GAME_CONFIG", "get", null, null);
};

export {
    postLogin,
    getCategories,
    postBet,
    getQuestion,
    postAnswer,
    getLeaderboard,
    getGameConfig
};
