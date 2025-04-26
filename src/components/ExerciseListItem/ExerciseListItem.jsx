const ExerciseListItem = ({ name, muscleGroup, onAdd, isAdded }) => {
    return (
      <div className="flex items-center justify-between p-2 border rounded hover:bg-gray-100">
        <div>
          <p className="font-medium">{name}</p>
          <span className="text-sm text-gray-500">{muscleGroup}</span>
        </div>
        {isAdded ? (
          <button
            className="bg-green-500 text-white font-bold py-1 px-2 rounded cursor-default"
            disabled
          >
            ✓
          </button>
        ) : (
          <button
            onClick={onAdd}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
          >
            +
          </button>
        )}
      </div>
    );
  };
  

export default ExerciseListItem;