const useURL = () => {
    const URL = {
        BASE: "/",
        HOME: "/gamblingmaths",
        INSTRUCTIONS: "/instructions",
        SELECT: "/select",
        CATEGORIES: "/categories",
        QUESTION: "/question",
        FINISHED: "/finished",
        LEADERBOARD: "/leaderboard",

        API_BASE: "https://bits-apogee.org/2025/main/gm_api",
        API_LOGIN: "/login",
        API_CATEGORY: "/category",
        API_MAX_BET: "/get_max_bet",
        API_PLACE_BET: "/place_bet",
        API_GET_QUESTION: "/get_question",
        API_ANSWER: "/answer",
        API_LEADERBOARD: "/leaderboard"
    };

    return URL;
};

const useInstructions = () => {
    const instructions = [
        "1. Each team can attempt only once.",
        "2. Teams will have 10 minutes to understand the rules and strategize.",
        "3. Teams will have a maximum of 50 minutes to attempt questions.",
        "4. Each team will begin with 3,000 points.",
        "5. There are 15 total categories: 13 Math Categories and 2 Mental Aptitude.",
        "6. Teams have to attempt exactly 12 categories from the given 15.",
        "7. Within each category, teams can choose:",
        [
            "Easy Question (1.25x bet reward on correct answer).",
            "Medium Question (2x bet reward on correct answer).",
            "Hard Question (4x bet reward on correct answer)"
        ],
        "8. Minimum bet amount: 200 points.",
        "9. After betting you will be shown a question which will have 4 options out of which only 1 will be correct.",
        "10. Incorrect or unanswered questions receive no points.",
        "11. Teams will be penalized 10 percent of their final score for every math category they skip. Penalty is applied after all questions are attempted or time runs out.",
        "12. Teams can attempt questions in any order.",
        "13. All categories and difficulties are visible before making choices wisely.",
        "14. Minimum score cannot go below 0 points. If your coins are out, the game will end.",
        "15. Ties will be resolved on the basis of time taken to complete the game.",
        "16. Users shall be logged out after 3 minutes of inactivity. Hence, submit your answer within 3 minutes."
    ];

    return instructions;
};

const useLevels = () => {
    const levels = [
        { level: "E", text: "Easy" },
        { level: "M", text: "Medium" },
        { level: "H", text: "Hard" }
    ];

    return levels;
};

export { useURL, useInstructions, useLevels };
