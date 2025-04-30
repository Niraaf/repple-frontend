import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ExerciseCard({ ex, index, onChange, onDelete }) {
    const uniqueId = ex.id || ex.tempId;
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: uniqueId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        boxShadow: isDragging ? "var(--shadow-lg)" : "var(--shadow-md)",
        zIndex: isDragging ? "45" : "",
        backgroundColor: isDragging ? "rgba(255, 255, 255, 0.5)" : ""
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="w-50 min-h-50 rounded-xl p-3 flex flex-col justify-between cursor-grab active:cursor-grabbing bg-white/30 backdrop-blur-md relative border-4 border-b-0 border-white/30"
        >
            {/* Position Badge */}
            <div className="absolute -top-2 -left-2 bg-purple-200 text-purple-700 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shadow-sm">
                {index + 1}
            </div>

            <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-gray-800 leading-snug">⚔️ {ex.name}</h3>
                    <button
                        className="text-gray-300 hover:text-red-400 transition text-sm cursor-pointer"
                        onClick={() => onDelete(uniqueId)}
                    >
                        ✕
                    </button>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
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

            {/* Stats */}
            <div className="flex flex-col gap-1 text-[11px]">
                {[
                    { label: "Sets", field: "sets", value: ex.sets },
                    { label: "Reps", field: "reps", value: ex.reps },
                    { label: "Rest", field: "rest_between_sets", value: ex.rest_between_sets }
                ].map(({ label, field, value }) => (
                    <div key={field} className="flex justify-between items-center">
                        <span className="text-gray-500">{label}</span>
                        <input
                            type="number"
                            min="1"
                            value={value}
                            onChange={(e) => onChange(field, e.target.value)}
                            className="w-14 text-center border border-gray-200 rounded focus:ring-1 focus:ring-blue-300 text-[11px] bg-white"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
