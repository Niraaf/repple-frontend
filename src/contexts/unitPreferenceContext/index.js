'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../authContext';

const UnitPreferenceContext = createContext();

export const useUnitPreference = () => {
    return useContext(UnitPreferenceContext);
};

const KG_TO_LBS = 2.20462;

export const UnitPreferenceProvider = ({ children }) => {
    const { userProfile } = useAuth();
    const unitPreference = userProfile?.unit_preference || 'kg';

    const convertWeight = (weightInKg) => {
        if (unitPreference === 'lbs') {
            return Math.round((weightInKg * KG_TO_LBS) * 100) / 100;
        }
        return weightInKg;
    };

    const value = useMemo(() => ({
        unitPreference,
        convertWeight,
    }), [unitPreference]);

    return (
        <UnitPreferenceContext.Provider value={value}>
            {children}
        </UnitPreferenceContext.Provider>
    );
};