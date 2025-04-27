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
            className="w-35 h-45 bg-white border rounded-lg p-3 flex flex-col justify-between hover:shadow-md cursor-grab active:cursor-grabbing"
        >
            <div className="flex flex-col items-center">
                <h3 className="font-semibold text-center text-md">{ex.name}</h3>
                {ex.is_custom && (
                    <span className="text-[9px] mt-1 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full uppercase">
                        Custom
                    </span>
                )}
                <p className="text-[10px] text-gray-500 mt-2 text-center leading-tight">
                    {ex.muscle_group} • {ex.type}
                    <br />
                    {ex.equipment} • {ex.focus}
                </p>
            </div>

            <div className="flex flex-col items-center gap-2">
                <div>
                    <span className="text-[10px] text-gray-400">Sets</span>
                    <input type="number" min="1" value={ex.sets} onChange={(e) => handleInputChange('sets', e.target.value)}
                        className="w-12 text-center text-xs border rounded"
                    />
                </div>
                <div>
                    <span className="text-[10px] text-gray-400">Reps</span>
                    <input type="number" min="1" value={ex.reps} onChange={(e) => handleInputChange('reps', e.target.value)}
                        className="w-12 text-center text-xs border rounded"
                    />
                </div>
            </div>
        </div>

    );

}