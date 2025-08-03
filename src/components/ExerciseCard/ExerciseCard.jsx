// components/ExerciseCard/ExerciseCard.jsx

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React, { useState } from 'react';

// A small sub-component for the Rep Target input
const RepTargetInput = ({ value, onChange }) => {
    const isRange = value?.includes('-');
    const isAmrap = value === 'AMRAP';
    const initialMode = isAmrap ? 'failure' : (isRange ? 'range' : 'single');

    const [mode, setMode] = useState(initialMode);

    const handleModeChange = (newMode) => {
        setMode(newMode);
        if (newMode === 'failure') onChange('AMRAP');
        else if (newMode === 'single') onChange('8');
        else if (newMode === 'range') onChange('8-12');
    };

    const handleRangeChange = (part, val) => {
        const parts = value.split('-');
        if (part === 'min') onChange(`${val}-${parts[1] || val}`);
        if (part === 'max') onChange(`${parts[0] || val}-${val}`);
    };

    return (
        <div className="flex flex-col gap-2 justify-between">
            <div className="flex justify-between items-center">
                <span className="text-gray-500">Rep Target</span>
                <div className="flex text-xs border border-gray-200 rounded-md overflow-hidden">
                    <button onClick={() => handleModeChange('single')} className={`px-2 py-0.5 ${mode === 'single' ? 'bg-blue-200' : 'bg-white'}`}>Single</button>
                    <button onClick={() => handleModeChange('range')} className={`px-2 py-0.5 ${mode === 'range' ? 'bg-blue-200' : 'bg-white'}`}>Range</button>
                    <button onClick={() => handleModeChange('failure')} className={`px-2 py-0.5 ${mode === 'failure' ? 'bg-blue-200' : 'bg-white'}`}>AMRAP</button>
                </div>
            </div>
            {mode === 'single' && (
                <div className="flex items-center justify-center">
                    <input type="text" inputMode="numeric" value={value} onChange={(e) => onChange(e.target.value)} className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white" />
                </div>
            )}
            {mode === 'range' && (
                <div className="flex gap-2 items-center justify-center">
                    <input type="text" inputMode="numeric" value={value.split('-')[0] || ''} onChange={(e) => handleRangeChange('min', e.target.value)} className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white" />
                    <span>-</span>
                    <input type="text" inputMode="numeric" value={value.split('-')[1] || ''} onChange={(e) => handleRangeChange('max', e.target.value)} className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white" />
                </div>
            )}
        </div>
    );
};


export default function ExerciseCard({ id, step, index, onChange, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: CSS.Translate.toString(transform),
        boxShadow: isDragging ? "0 4px 15px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
        zIndex: isDragging ? 45 : "auto",
        backgroundColor: isDragging ? "rgba(255, 255, 255, 0.7)" : ""
    };

    const exerciseDetails = step.exercise || {};
    const mechanics = exerciseDetails.mechanics;

    const renderInputs = () => {
        const isTimed = mechanics.some(m => m.name.toLowerCase().includes('isometric') || m.name.toLowerCase().includes('stretching'));
        return (
            <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500">Sets</span>
                    <input type="text" inputMode="numeric" value={step.target_sets || ''} onChange={(e) => onChange('target_sets', e.target.value)} className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white" />
                </div>

                {isTimed ? (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Hold (sec)</span>
                        <input type="text" inputMode="numeric" value={step.target_duration_seconds || ''} onChange={(e) => onChange('target_duration_seconds', e.target.value)} className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white" />
                    </div>
                ) : (
                    <RepTargetInput value={step.target_reps || ''} onChange={(newValue) => onChange('target_reps', newValue)} />
                )}

                {!mechanics.some(m => m.name.toLowerCase().includes('stretching')) && (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Rest (sec)</span>
                        <input type="text" inputMode="numeric" value={step.target_intra_set_rest_seconds || ''} onChange={(e) => onChange('target_intra_set_rest_seconds', e.target.value)} className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={setNodeRef} style={style} className="w-75 h-60 rounded-xl p-3 flex flex-col bg-white/30 backdrop-blur-md relative border-4 border-b-0 border-white/30">
            {/* Draggable Handle and Header */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-gray-800 leading-snug">⚔️ {exerciseDetails.name}</h3>
                    <button onClick={onDelete} className="text-gray-400 hover:text-red-500 ...">✕</button>
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