import { useEffect } from "react";

const defaultTitle = "Gambling Maths";

const useTitle = (title = "") => {
    useEffect(() => {
        document.title = title ? `${defaultTitle} | ${title}` : defaultTitle;

        return () => (document.title = defaultTitle);
    }, [title]);
};

const usePathName = () => {
    return window?.location?.pathname?.replace(/\/gamblingmaths/g, "");
};

export { useTitle, usePathName };
