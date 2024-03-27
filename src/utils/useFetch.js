import axios from "axios";

const useFetch = async (url, method = "get", data = null, headers = {}) => {
    try {
        const response = await axios({
            method,
            url,
            data,
            headers
        });
        return { data: response.data, error: null };
    } catch (error) {
        return { data: null, error };
    }
};

export default useFetch;
