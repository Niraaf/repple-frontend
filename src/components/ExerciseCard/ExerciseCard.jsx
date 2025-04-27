import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ExerciseCard({ ex, onChange }) {
    const uniqueId = ex.id || ex.tempId;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: uniqueId });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? "#e0f7fa" : "#fff",
        boxShadow: isDragging ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
    };

    const handleInputChange = (field, value) => {
        onChange(field, value);
    };


    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="w-64 bg-white border border-gray-300 rounded-lg shadow-sm p-4 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-move"
        >
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-gray-800">{ex.name}</h3>
                {ex.is_custom && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        Custom
                    </span>
                )}
            </div>

            <p className="text-sm text-gray-500">
                {ex.muscle_group} • {ex.type} • {ex.equipment} • {ex.focus}
            </p>

            <div className="flex gap-4 mt-2">
                <div className="flex flex-col text-sm">
                    <label className="text-gray-500">Sets</label>
                    <input
                        type="number"
                        min="1"
                        value={ex.sets}
                        onChange={(e) => handleInputChange('sets', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex flex-col text-sm">
                    <label className="text-gray-500">Reps</label>
                    <input
                        type="number"
                        min="1"
                        value={ex.reps}
                        onChange={(e) => handleInputChange('reps', e.target.value)}
                        className="w-16 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex flex-col text-sm">
                    <label className="text-gray-500">Rest (s)</label>
                    <input
                        type="number"
                        min="0"
                        value={ex.rest_seconds_planned}
                        onChange={(e) => handleInputChange('rest_seconds_planned', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>
        </div>
    );

}