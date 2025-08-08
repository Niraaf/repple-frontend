"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState, useEffect } from 'react';

// A small sub-component for the Rep Target input
const RepTargetInput = ({ value, isEditMode, isProcessing, onBlur, onChange }) => {
    useEffect(() => {
        const stringValue = String(value || '');
        const isRange = stringValue.includes('-');
        const isAmrap = stringValue === 'AMRAP';
        const newMode = isAmrap ? 'failure' : (isRange ? 'range' : 'single');
        setMode(newMode);
    }, [value]);

    const [mode, setMode] = useState('single');

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'failure') onChange('AMRAP');
        else if (newMode === 'single') onChange('8');
        else if (newMode === 'range') onChange('8-12');
    };

    const handleSingleRepChange = (val) => {
        const sanitizedValue = val.toString().replace(/[^0-9]/g, '');
        if (sanitizedValue === '') {
            onChange(''); // Allow clearing the input
        } else {
            const numericValue = parseInt(sanitizedValue, 10);
            onChange(String(Math.min(numericValue, 999))); // Clamp and ensure it's a string
        }
    };

    const handleRangeChange = (part, val) => {
        // Sanitize and cap the input value
        const sanitizedValue = val.toString().replace(/[^0-9]/g, '');
        const numericValue = sanitizedValue === '' ? '' : Math.min(parseInt(sanitizedValue, 10), 999);

        const parts = String(value).split('-');
        if (part === 'min') {
            onChange(`${numericValue}-${parts[1] || numericValue}`);
        } else { // max
            onChange(`${parts[0] || numericValue}-${numericValue}`);
        }
    };

    const handleRangeBlur = () => {
        let [min, max] = String(value).split('-').map(v => parseInt(v) || 1);

        // Ensure min is at least 1
        min = Math.min(Math.max(min, 1), 998);
        // Ensure max is at least min + 1
        max = Math.min(Math.max(max, min + 1), 999);

        onChange(`${min}-${max}`);
    };

    if (!isEditMode) {
        const displayValue = value === 'AMRAP' ? 'AMRAP' : `${value} Reps`;
        return (
            <div className="flex justify-between items-center h-[30px]">
                <span className="text-gray-500">Rep Target</span>
                <span className="font-semibold text-gray-700">{displayValue}</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 justify-between">
            <div className="flex justify-between items-center">
                <span className="text-gray-500">Rep Target</span>
                <div className="flex text-xs border border-gray-200 rounded-md overflow-hidden">
                    <button onClick={() => handleModeChange('single')} disabled={isProcessing} className={`px-2 py-0.5 ${mode === 'single' ? 'bg-blue-200' : 'bg-white'}`}>Single</button>
                    <button onClick={() => handleModeChange('range')} disabled={isProcessing} className={`px-2 py-0.5 ${mode === 'range' ? 'bg-blue-200' : 'bg-white'}`}>Range</button>
                    <button onClick={() => handleModeChange('failure')} disabled={isProcessing} className={`px-2 py-0.5 ${mode === 'failure' ? 'bg-blue-200' : 'bg-white'}`}>AMRAP</button>
                </div>
            </div>
            {mode === 'single' && (
                <div className="flex gap-2 items-center justify-center box-border ">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={value}
                        onBlur={onBlur}
                        readOnly={isProcessing}
                        onChange={(e) => handleSingleRepChange(e.target.value)}
                        className="remove-arrows w-14 text-center py-1 border border-gray-200 rounded-md bg-white read-only:bg-transparent read-only:border-transparent read-only:ring-0 read-only:font-semibold read-only:text-gray-700"
                    />
                </div>
            )}
            {mode === 'range' && (
                <div className="flex gap-2 items-center justify-center box-border ">
                    <input type="text" inputMode="numeric" value={String(value).split('-')[0] || ''} onBlur={handleRangeBlur} readOnly={isProcessing} onChange={(e) => handleRangeChange('min', e.target.value)} className="remove-arrows text-center w-14 py-1 border border-gray-200 rounded-md bg-white read-only:bg-transparent read-only:border-transparent read-only:ring-0 read-only:font-semibold read-only:text-gray-700" />
                    <span>-</span>
                    <input type="text" inputMode="numeric" value={String(value).split('-')[1] || ''} onBlur={handleRangeBlur} readOnly={isProcessing} onChange={(e) => handleRangeChange('max', e.target.value)} className="remove-arrows text-center w-14 py-1 border border-gray-200 rounded-md bg-white read-only:bg-transparent read-only:border-transparent read-only:ring-0 read-only:font-semibold read-only:text-gray-700" />
                </div>
            )}
        </div>
    );
};


export default function ExerciseCard({ id, step, index, isEditMode, isProcessing, onBlur, onChange, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        boxShadow: isDragging ? "0 4px 15px rgba(162, 78, 78, 0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
        zIndex: isDragging ? 45 : "auto",
        backgroundColor: isDragging ? "rgba(255, 255, 255, 0.7)" : ""
    };

    const exerciseDetails = step.exercise || {};
    const mechanics = exerciseDetails.mechanics || [];

    const renderInputs = () => {
        const isTimed = mechanics.some(m => m && m.name && (m.name.toLowerCase().includes('isometric') || m.name.toLowerCase().includes('stretching')));
        const inputBaseClasses = "remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white read-only:bg-transparent read-only:border-transparent read-only:ring-0 read-only:font-semibold read-only:text-gray-700";

        return (
            <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Sets</span>
                    <input type="text" inputMode="numeric" value={step.target_sets || ''} readOnly={!isEditMode || isProcessing} onBlur={() => onBlur('target_sets')} onChange={(e) => onChange('target_sets', e.target.value)} className={inputBaseClasses} />
                </div>

                {isTimed ? (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Hold (sec)</span>
                        <input type="text" inputMode="numeric" value={step.target_duration_seconds || ''} readOnly={!isEditMode || isProcessing} onBlur={() => onBlur('target_duration_seconds')} onChange={(e) => onChange('target_duration_seconds', e.target.value)} className={inputBaseClasses} />
                    </div>
                ) : (
                    <RepTargetInput
                        value={step.target_reps || ''}
                        isEditMode={isEditMode}
                        isProcessing={isProcessing}
                        onBlur={() => onBlur('target_reps')}
                        onChange={(newValue) => onChange('target_reps', newValue)}
                    />
                )}

                {!mechanics.some(m => m && m.name && m.name.toLowerCase().includes('stretching')) && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Rest (sec)</span>
                        <input type="text" inputMode="numeric" value={step.target_intra_set_rest_seconds || ''} readOnly={!isEditMode || isProcessing} onBlur={() => onBlur('target_intra_set_rest_seconds')} onChange={(e) => onChange('target_intra_set_rest_seconds', e.target.value)} className={inputBaseClasses} />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={setNodeRef} style={style} className="w-75 h-60 rounded-xl p-3 flex flex-col bg-white/30 backdrop-blur-md relative border-4 border-b-0 border-white/30">
            {/* Draggable Handle and Header */}
            <div {...attributes} {...(isEditMode || !isProcessing ? listeners : {})} className={`${isEditMode || !isProcessing ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-gray-800 leading-snug">⚔️ {exerciseDetails.name}</h3>
                    {isEditMode && <button onClick={onDelete} disabled={isProcessing} className="absolute top-2 right-2 text-gray-300 hover:text-red-400 transition text-sm cursor-pointer w-6 h-6">✕</button>}
                </div>
            </div>

            {/* Position Badge */}
            <div className="absolute -top-2 -left-2 bg-purple-200 text-purple-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">{index + 1}</div>

            {/* Tags (assuming API provides this structure) */}
            <div className="flex flex-wrap gap-1 my-2">
                {exerciseDetails.muscles?.slice(0, 2).map(m => (
                    <span key={m.id} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">{m.name}</span>
                ))}
                {exerciseDetails.equipments?.slice(0, 1).map(e => (
                    <span key={e.id} className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">{e.name}</span>
                ))}
                {exerciseDetails.mechanics?.slice(0, 1).map(e => (
                    <span key={e.id} className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">{e.name}</span>
                ))}
                {exerciseDetails.focuses?.slice(0, 1).map(e => (
                    <span key={e.id} className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full">{e.name}</span>
                ))}
            </div>

            {/* Dynamic Stats Inputs */}
            {renderInputs()}
        </div>
    );
}