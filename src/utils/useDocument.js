import { useEffect } from "react";

const defaultTitle = "Gambling Maths";

const useTitle = (title = "") => {
    useEffect(() => {
        document.title = title ? `${defaultTitle} | ${title}` : defaultTitle;

        return () => (document.title = defaultTitle);
    }, [title]);
};

export { useTitle };
