import { useEffect } from "react";
import { useUnsavedChanges } from "@/contexts/unsavedChangesContext";

export function useUnsavedChangesWarning() {
    const { hasUnsavedChanges } = useUnsavedChanges();
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!hasUnsavedChanges) return;

            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [hasUnsavedChanges]);
}
