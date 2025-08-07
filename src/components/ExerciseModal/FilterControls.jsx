"use client";

import React, { useState, useEffect, useRef } from 'react';

export default function FilterControls({ filterOptions, activeFilters, handleFilterChange, searchQuery, setSearchQuery }) {
    const [activeDropdown, setActiveDropdown] = useState(null); // Manages which dropdown is open
    const activeDropdownRef = useRef(null);
    const activeTriggerRef = useRef(null);

    const handleFilterButtonClick = (filterLabel, event) => {
        if (activeDropdown?.label === filterLabel) {
            setActiveDropdown(null);
            activeTriggerRef.current = null;
        } else {
            const rect = event.currentTarget.getBoundingClientRect();
            const alignRight = rect.left > window.innerWidth / 2;
            setActiveDropdown({ label: filterLabel, alignRight });
            activeTriggerRef.current = event.currentTarget;
        }
    };

    // This effect handles closing the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdownRef.current && !activeDropdownRef.current.contains(event.target) &&
                activeTriggerRef.current && !activeTriggerRef.current.contains(event.target)) {
                setActiveDropdown(null);
                activeTriggerRef.current = null;
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    // Map the filter keys to the display labels from your original code
    const filterButtons = [
        { label: 'Muscle Group', key: 'muscles', options: filterOptions.muscles },
        { label: 'Equipment', key: 'equipments', options: filterOptions.equipments },
        { label: 'Exercise Mechanic', key: 'mechanics', options: filterOptions.mechanics },
        { label: 'Focus', key: 'focuses', options: filterOptions.focuses },
    ];

    return (
        <div className="w-full">
            {/* Search Bar */}
            <div className="mb-6 w-full">
                <input
                    type="text"
                    placeholder="Search for an exercise..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-300 focus:outline-none text-sm"
                />
            </div>

            {/* Active Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-2 min-h-[28px]">
                {Object.entries(activeFilters).flatMap(([categoryKey, selectedOptions]) =>
                    selectedOptions.map(option => (
                        <button
                            key={`${categoryKey}-${option}`}
                            className="flex items-center bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition"
                            onClick={() => handleFilterChange(categoryKey, option)}
                        >
                            {option} <span className="ml-1 font-bold">✕</span>
                        </button>
                    ))
                )}
            </div>
            
            {/* Filter Buttons & Dropdowns */}
            <div className="flex flex-wrap gap-4 mb-3 justify-center">
                {filterButtons.map(({ label, key, options }) => (
                    <div key={label} className="relative">
                        <button
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-semibold py-2 px-4 rounded-full transition"
                            onClick={(e) => handleFilterButtonClick(label, e)}
                        >
                            {label}
                        </button>
                        {activeDropdown?.label === label && (
                            <div
                                ref={activeDropdownRef}
                                className={`absolute overflow-hidden mt-2 bg-white border border-gray-300 rounded-xl shadow-lg w-48 z-20 animate-fade-in ${activeDropdown.alignRight ? 'right-0' : 'left-0'}`}
                            >
                                {options.map(option => {
                                    const isSelected = activeFilters[key]?.includes(option.name);
                                    return (
                                        <button
                                            key={option.id}
                                            className={`w-full text-left text-sm px-4 py-2 hover:bg-gray-100 transition ${isSelected ? 'bg-blue-50 font-semibold' : ''}`}
                                            onClick={() => handleFilterChange(key, option.name)}
                                        >
                                            {option.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}