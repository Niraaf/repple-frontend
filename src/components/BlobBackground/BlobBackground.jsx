export default function BlobBackground() {
    return (
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
            {/* All 6 Gradient Layers MUST be present for the transitions to work */}
            <div className="absolute inset-0 bg-gradient-default"></div>
            <div className="absolute inset-0 bg-gradient-ready"></div>
            <div className="absolute inset-0 bg-gradient-active_set"></div>
            <div className="absolute inset-0 bg-gradient-resting"></div>
            <div className="absolute inset-0 bg-gradient-logging"></div>
            <div className="absolute inset-0 bg-gradient-finished"></div>

            {/* The 3 Blob Divs */}
            <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float-slow bg-blob-1 transition-colors duration-700" />
            <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full opacity-30 blur-3xl animate-float-slower bg-blob-2 transition-colors duration-700" />
            <div className="absolute top-1/3 left-1/2 w-80 h-80 rounded-full opacity-20 blur-3xl animate-float bg-blob-3 transition-colors duration-700" />
        </div>
    );
}