const ExerciseListItem = ({ ex, onAdd, isAdded }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-sm transition h-20">

      {/* Info */}
      <div className="flex flex-col">
        <p className="font-semibold text-sm text-gray-800">{ex.name}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {ex.muscle_groups.map(group => (
            <span key={group} className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">
              {group}
            </span>
          ))}
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">
            {ex.equipment}
          </span>
          <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-full">
            {ex.type}
          </span>
          <span className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded-full">
            {ex.focus}
          </span>
        </div>
      </div>

      {/* Action */}
      {isAdded ? (
        <div className="flex items-center justify-center w-8 h-8 bg-green-200 text-green-700 rounded-full text-sm cursor-default">
          ✓
        </div>
      ) : (
        <button
          onClick={onAdd}
          className="flex items-center justify-center w-8 h-8 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-lg transition"
          aria-label="Add Exercise"
        >
          +
        </button>
      )}
    </div>
  );
};
export default ExerciseListItem;