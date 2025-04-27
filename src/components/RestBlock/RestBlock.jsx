export default function RestBlock({ value, onChange }) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 p-3 bg-yellow-50 border border-dashed border-yellow-300 rounded-lg shadow-sm w-15">
            <span className="text-xs uppercase text-yellow-600 tracking-wider">Rest</span>
            <input
                type="number"
                min="0"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="remove-arrows w-10 text-center px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            />
            <span className="text-sm text-gray-500">sec</span>
        </div>
    );
}
