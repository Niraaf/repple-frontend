'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from '../authContext';

const UnitPreferenceContext = createContext();

export const useUnitPreference = () => {
    return useContext(UnitPreferenceContext);
};

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

export const UnitPreferenceProvider = ({ children }) => {
    const { userProfile } = useAuth();
    const unitPreference = userProfile?.unit_preference || 'kg';

    const convertWeight = (weightInKg) => {
        if (unitPreference === 'lbs') {
            return Math.round((weightInKg * KG_TO_LBS) * 100) / 100;
        }
        return weightInKg;
    };

    const convertToKg = (weightInPreference) => {
        if (unitPreference === 'lbs') {
            return Math.round((weightInPreference * LBS_TO_KG) * 100) / 100;
        }
        return weightInPreference;
    };

    const value = useMemo(() => ({
        displayUnit: unitPreference,
        convertWeight,
        convertToKg
    }), [unitPreference, convertToKg, convertWeight]);

    return (
        <UnitPreferenceContext.Provider value={value}>
            {children}
        </UnitPreferenceContext.Provider>
    );
};