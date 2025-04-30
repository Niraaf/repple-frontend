export default function RestBlock({ value, onChange }) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 p-3 bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm">
            <span className="text-sm font-medium text-yellow-600">Rest</span>
            <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="remove-arrows w-12 text-center py-1 border border-gray-200 rounded focus:ring-1 focus:ring-yellow-300 text-[11px] bg-white"
            />
            <span className="text-[9px] text-gray-400">sec</span>
        </div>
    );
}
