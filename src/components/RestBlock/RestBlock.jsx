export default function RestBlock({ value, onChange }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-1 p-3 border-4 border-b-0 border-white/30 rounded-xl shadow-md"
            style={{
                background: "radial-gradient(circle, rgba(255,255,200,0.3), rgba(255,235,150,0.2))",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
            }}
        >
            <span className="text-sm font-medium text-yellow-700">Rest</span>
            <input
                type="text"
                inputMode="numeric"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={(e) => onChange(parseInt(e.target.value) || "1")}
                className="remove-arrows w-12 text-center py-1 border border-gray-200 rounded focus:ring-1 focus:ring-yellow-300 text-[11px] bg-white"
            />
            <span className="text-[9px] text-gray-400">sec</span>
        </div>
    );
}
