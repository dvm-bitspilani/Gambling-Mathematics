const useURL = () => {
    const URL = {
        BASE: "/",
        HOME: "/gamblingmaths",
        INSTRUCTIONS: "/instructions",
        SELECT: "/select",
        CATEGORIES: "/categories",
        QUESTION: "/question",
        FINISHED: "/finished",

        API_BASE: "https://test.bits-apogee.org/2024/main/gm_api",
        API_LOGIN: "/login",
        API_CATEGORY: "/category",
        API_MAX_BET: "/get_max_bet",
        API_PLACE_BET: "/place_bet"
    };

    return URL;
};

const useInstructions = () => {
    const instructionList = [
        "A team can attempt only once.",
        "You will be given 1000 coins initially.",
        "There are 8 categories. You will choose a category and bet some amount of coins.",
        "In each round a player has to bet a minimum of 200 coins.",
        "After betting the coins, you will be shown a question which will have 4 options out of which only 1 will be correct.",
        "If the answer is right you will get the coins back after being multiplied by the multiplier.",
        "If the answer is wrong, the betted coins will be lost.",
        "After attempting one question from the chosen category, you will choose another category and then bet and so on till you complete all the categories.",
        "If you are out of the coins, your game will end.",
        "After attempting all the 8 categories, your final amount of coins will be stored and the top 12 teams according to the number of coins will proceed to the next round.",
        "Ties will be resolved on the basis of time taken to complete the game.",
        "The maximum number of you can bet in each round and its corresponding multiplier is as follows."
    ];

    return instructionList;
};

export { useURL, useInstructions };
