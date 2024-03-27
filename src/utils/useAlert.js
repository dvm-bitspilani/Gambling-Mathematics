import { useState } from "react";

const initialState = { status: false, message: "", title: "" };

const useAlert = () => {
    const [error, setError] = useState(initialState);
    const [success, setSuccess] = useState(initialState);

    const setErrorText = message => {
        setError({ status: true, message, title: "ERROR" });
        setSuccess(initialState);
    };

    const setSuccessText = message => {
        setSuccess({ status: true, message, title: "SUCCESS" });
        setError(initialState);
    };

    const clearAll = () => {
        setError(initialState);
        setSuccess(initialState);
    };

    return { error, success, setErrorText, setSuccessText, clearAll };
};

export default useAlert;
