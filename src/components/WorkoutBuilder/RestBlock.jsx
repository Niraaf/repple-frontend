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
            className="flex flex-col items-center justify-center w-75 h-60 rounded-xl p-3 bg-yellow-50/50 backdrop-blur-md relative border-4 border-b-0 border-white/30"
        >
            {/* Draggable Handle */}
            <div {...attributes} {...(isEditMode || !isProcessing ? listeners : {})} className={`w-full flex justify-center pb-2 ${isEditMode || !isProcessing ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}>
                <span className="text-sm font-medium text-yellow-800">⏱️ Rest</span>
            </div>

            {/* Position Badge */}
            <div className="absolute -top-2 -left-2 bg-yellow-200 text-yellow-800 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
                {index + 1}
            </div>

            {/* Delete Button */}
            {isEditMode && (
                <button
                    onClick={onDelete}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500 rounded-full w-6 h-6 flex items-center justify-center text-sm transition cursor-pointer"
                >
                    ✕
                </button>
            )}

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