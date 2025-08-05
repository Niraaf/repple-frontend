import React, { useState } from 'react';

const ExerciseListItem = ({ ex, onAdd }) => {
    const [isClicked, setIsClicked] = useState(false);

    const handleAddClick = () => {
        onAdd(ex);
        setIsClicked(true);
        setTimeout(() => {
            setIsClicked(false);
        }, 500);
    };
    return (
        <div className="flex items-center justify-between p-4 bg-white/50 hover:bg-white/70 border-4 border-b-0 border-white/30 rounded-xl hover:shadow-sm transition">

            {/* Info Section */}
            <div className="flex flex-col">
                <p className="font-semibold text-sm text-gray-800">{ex.name}</p>

                {/* The tags section is now updated to read from the new data structure.
                  e.g., ex.muscles is now an array of objects [{id, name}].
                  We also add (ex.muscles || []) as a safety check to prevent crashes if the data is missing.
                */}
                <div className="flex flex-wrap gap-1 mt-1">
                    {(ex.muscles || []).map(group => (
                        <span key={group.id} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
                            {group.name}
                        </span>
                    ))}
                    {(ex.equipments || []).map(equipment => (
                        <span key={equipment.id} className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">
                            {equipment.name}
                        </span>
                    ))}
                    {(ex.mechanics || []).map(mechanic => (
                        <span key={mechanic.id} className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">
                            {mechanic.name}
                        </span>
                    ))}
                    {(ex.focuses || []).map(focus => (
                        <span key={focus.id} className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full">
                            {focus.name}
                        </span>
                    ))}
                </div>
            </div>

            {/* Action Button Section */}
            <button
                onClick={handleAddClick}
                disabled={isClicked}
                className={`flex items-center justify-center w-8 h-8 text-white rounded-full text-xl transition-all duration-200 ease-in-out shrink-0
                    ${isClicked
                        ? 'bg-green-500 scale-110 rotate-[360deg]' // The "success" style
                        : 'bg-purple-500 hover:bg-purple-600 cursor-pointer'      // The normal style
                    }
                `}
                aria-label="Add Exercise"
            >
                {isClicked ? '✓' : '+'}
            </button>
        </div>
    );
};

export default ExerciseListItem;