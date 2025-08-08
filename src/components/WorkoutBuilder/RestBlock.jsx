"use client";

import React, { useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function RestBlock({ id, step, index, isEditMode, isProcessing, onBlur, onChange, onDelete }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        boxShadow: isDragging ? "0 4px 15px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
        zIndex: isDragging ? "45" : "",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex flex-col items-center justify-center w-75 h-62 rounded-xl p-3 bg-yellow-50/50 backdrop-blur-md relative border-4 border-b-0 border-white/30"
        >   
            {/* Delete Button */}
            <div className="w-full h-full absolute top-0 left-0 -z-1">
                <div {...attributes} {...(isEditMode && !isProcessing ? listeners : {})} className={`flex justify-end items-start mb-1 p-3 ${isEditMode && !isProcessing ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
                    {isEditMode && <button onClick={onDelete} disabled={isProcessing} className="text-gray-300 hover:text-red-400 transition text-sm cursor-pointer">✕</button>}
                </div>
            </div>

            {/* Draggable Handle */}
            <div className={`w-full flex justify-center pb-2`}>
                <span className="text-sm font-medium text-yellow-800">⏱️ Rest</span>
            </div>

            {/* Position Badge */}
            <div className="absolute -top-2 -left-2 bg-yellow-200 text-yellow-800 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
                {index + 1}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    inputMode="numeric"
                    value={step.target_duration_seconds || ''}
                    readOnly={!isEditMode || isProcessing}
                    onBlur={() => onBlur('target_duration_seconds')}
                    onChange={(e) => onChange('target_duration_seconds', e.target.value)}
                    className="remove-arrows w-16 text-center py-1 border border-gray-200 rounded-md bg-white 
                               read-only:bg-transparent read-only:border-transparent read-only:ring-0 read-only:font-semibold read-only:text-gray-700"
                />
                <span className="text-sm text-gray-500">sec</span>
            </div>
        </div>
    );
}