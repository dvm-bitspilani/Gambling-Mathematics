import { useEffect } from "react";

export const useTitle = title => {
    useEffect(() => {
        document.title = `Gambling Maths | ${title}`;
    }, [title]);
};
