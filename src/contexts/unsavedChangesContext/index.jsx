'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

const UnsavedChangesContext = createContext();

export const UnsavedChangesProvider = ({ children }) => {
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setHasUnsavedChanges(false);
    }, [pathname]);

    return (
        <UnsavedChangesContext.Provider value={{ hasUnsavedChanges, setHasUnsavedChanges }}>
            {children}
        </UnsavedChangesContext.Provider>
    );
};

export const useUnsavedChanges = () => useContext(UnsavedChangesContext);
