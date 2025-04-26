import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function ExerciseCard({ id, name }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = {
        width: "100%",
        height: "100%",
        transform: CSS.Transform.toString(transform),
        transition,
        background: isDragging ? "#e0f7fa" : "#fff",
        boxShadow: isDragging ? "0 2px 8px rgba(0,0,0,0.2)" : "none",
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} >
            <li className="w-full h-full p-4 rounded border cursor-move">
                {name}
            </li>
        </div>

    );
}