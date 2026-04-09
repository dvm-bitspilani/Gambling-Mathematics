import { useURL } from "./useData";
import Cookies from "js-cookie";

const buildUrl = (endpoint, addLink) => {
    const URL = useURL();
    const baseUrl = `${URL.API_BASE}${URL[endpoint]}`;

    return addLink ? `${baseUrl}/${addLink}` : baseUrl;
};

const getRefreshToken = () => {
    try {
        const storedUserCookie = Cookies.get("gm_user");
        if (storedUserCookie) {
            const user = JSON.parse(storedUserCookie);
            return user.refresh;
        }
    } catch (error) {
        console.error("Error retrieving refresh token from cookies.");
    }
    return null;
};

const updateTokenInCookies = (newAccessToken, newRefreshToken = null) => {
    try {
        const storedUserCookie = Cookies.get("gm_user");
        if (storedUserCookie) {
            const user = JSON.parse(storedUserCookie);
            user.token = newAccessToken;
            if (newRefreshToken) {
                user.refresh = newRefreshToken;
            }
            Cookies.set("gm_user", JSON.stringify(user), { expires: 365 });
        }
    } catch (error) {
        console.error("Error updating auth tokens in cookies.");
    }
};

const clearUserFromCookies = () => {
    Cookies.remove("gm_user");
};

const refreshAccessToken = async refreshToken => {
    try {
        const URL = useURL();
        const response = await fetch(
            `${URL.API_BASE}${URL.API_TOKEN_REFRESH}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ refresh: refreshToken })
            }
        );

        if (response.ok) {
            const data = await response.json();
            return {
                access: data.access,
                refresh: data.refresh || null
            };
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
    return null;
};

const fetchData = async (url, method, data, headers, onLogout) => {
    try {
        const URL = useURL();
        let response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
        });

        if (response.status === 401) {
            const refreshToken = getRefreshToken();

            if (refreshToken) {
                const refreshedTokens = await refreshAccessToken(refreshToken);

                if (refreshedTokens?.access) {
                    updateTokenInCookies(
                        refreshedTokens.access,
                        refreshedTokens.refresh
                    );

                    const newHeaders = {
                        ...headers,
                        Authorization: `Bearer ${refreshedTokens.access}`
                    };

                    response = await fetch(url, {
                        method,
                        headers: newHeaders,
                        body: data ? JSON.stringify(data) : undefined
                    });
                } else {
                    clearUserFromCookies();
                    if (onLogout) onLogout();
                    window.location.href = URL.HOME;
                    return {
                        data: null,
                        error: new Error("Session expired"),
                        loading: false
                    };
                }
            } else {
                clearUserFromCookies();
                if (onLogout) onLogout();
                window.location.href = URL.HOME;
                return {
                    data: null,
                    error: new Error("No refresh token"),
                    loading: false
                };
            }
        }

        if (!response.ok) {
            let body = {};
            try {
                body = await response.json();
            } catch {}

            const err = new Error(
                body.detail || `HTTP error! status: ${response.status}`
            );
            err.status = response.status;
            err.data = body;
            err.response = { status: response.status, data: body };
            throw err;
        }

        const responseData = await response.json();
        return { data: responseData, error: null, loading: false };
    } catch (error) {
        return { data: null, error, loading: false };
    }
};

const getActionableActiveBet = gameState => {
    if (!gameState || typeof gameState !== "object") {
        return null;
    }

    const activeBet = gameState.active_bet;
    if (activeBet && typeof activeBet === "object") {
        const level =
            activeBet.level ||
            activeBet.active_bet_level ||
            activeBet.bet_level ||
            activeBet.question_level ||
            null;

        const categoryId =
            activeBet.category_id ??
            activeBet.categoryId ??
            activeBet.category?.id ??
            null;

        const questionId =
            activeBet.question_id ??
            activeBet.questionId ??
            activeBet.assigned_question_id ??
            activeBet.assignedQuestionId ??
            activeBet.assigned_question?.id ??
            activeBet.question?.id ??
            null;

        const hasQuestion = Boolean(
            activeBet.has_question ??
            activeBet.question_assigned ??
            activeBet.question_started ??
            activeBet.question_started_at ??
            activeBet.question_start_time ??
            activeBet.assigned_question ??
            questionId
        );

        if (level) {
            return {
                id: activeBet.bet_id ?? activeBet.id ?? null,
                level,
                categoryId,
                questionId,
                hasQuestion,
                raw: activeBet
            };
        }
    }

    const legacyLevels = Array.isArray(gameState.open_bet_levels)
        ? gameState.open_bet_levels.filter(Boolean)
        : [];

    if (legacyLevels.length > 0) {
        return {
            id: null,
            level: legacyLevels[0],
            categoryId: null,
            questionId: null,
            hasQuestion: true,
            raw: null
        };
    }

    return null;
};

const createRequest = async (
    endpoint,
    method,
    data,
    userToken,
    addLink = null,
    onLogout = null
) => {
    const apiURL = buildUrl(endpoint, addLink);
    const headers = {
        ...(userToken && { Authorization: `Bearer ${userToken}` }),
        ...(data && { "Content-Type": "application/json" })
    };

    return await fetchData(apiURL, method, data, headers, onLogout);
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

const getGameState = async userToken => {
    return await createRequest("API_GAME_STATE", "get", null, userToken);
};

export {
    postLogin,
    getCategories,
    postBet,
    getQuestion,
    postAnswer,
    getLeaderboard,
    getGameConfig,
    getGameState,
    getActionableActiveBet
};
