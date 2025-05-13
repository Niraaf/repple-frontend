import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function useBlobTheme(theme) { // "default" | "exercise" | "rest"
    const pathname = usePathname();

    useEffect(() => {
        if (typeof window === "undefined") return;

        // ✅ force default theme if not on trainer/workout routes

        const appliedTheme = theme;

        document.body.classList.remove("repple-default", "repple-exercise", "repple-rest");
        document.body.classList.add(`repple-${appliedTheme}`);
    }, [theme, pathname]);
}
