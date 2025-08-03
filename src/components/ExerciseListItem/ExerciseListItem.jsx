const ExerciseListItem = ({ ex, onAdd, isAdded }) => {
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

            {/* Action Button Section (Identical to your original) */}
            {isAdded ? (
                <div className="flex items-center justify-center w-8 h-8 bg-green-200 text-green-700 rounded-full text-sm cursor-default shrink-0">
                    ✓
                </div>
            ) : (
                <button
                    onClick={onAdd}
                    className="flex items-center justify-center w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-lg transition shrink-0 cursor-pointer"
                    aria-label="Add Exercise"
                >
                    +
                </button>
            )}
        </div>
    );
};

export default ExerciseListItem;