import ExerciseListItem from '../ExerciseListItem/ExerciseListItem';

export default function ExerciseList({ exercises, onAddExercise, addedExerciseIds }) {
    if (exercises.length === 0) {
        return <p className="text-gray-400 text-sm col-span-2 text-center">No exercises found. Try adjusting your filters!</p>;
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full overflow-y-auto pr-2">
            {exercises.map((ex) => (
                <ExerciseListItem
                    key={ex.id}
                    ex={ex}
                    onAdd={() => onAddExercise(ex)}
                />
            ))}
        </div>
    );
}