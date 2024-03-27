import axios from "axios";

const useFetch = async (url, method = "get", data = null, headers = {}) => {
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

export default useFetch;
