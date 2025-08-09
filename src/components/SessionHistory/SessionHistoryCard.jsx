'use client';
import { useRouter } from "nextjs-toploader/app"

const workoutTypeStyles = {
    'Strength': { icon: '💪', color: 'text-red-500' },
    'Hypertrophy': { icon: '📈', color: 'text-orange-500' },
    'Endurance': { icon: '🏃‍♂️', color: 'text-sky-500' },
    'Mobility': { icon: '🧘', color: 'text-green-500' },
    'Mixed': { icon: '🔄', color: 'text-purple-500' },
    'General': { icon: '⚡', color: 'text-gray-500' },
};

export default function SessionHistoryCard({ session }) {
    const router = useRouter();
    const date = new Date(session.started_at);
    const style = workoutTypeStyles[session.workout_type] || workoutTypeStyles['General'];

    return (
        <div
            onClick={() => router.push(`/history/${session.id}`)}
            className="w-full max-w-3xl bg-white/30 hover:bg-white/50 border-4 border-b-0 border-white/30 rounded-xl shadow-md p-4 cursor-pointer transition hover:shadow-lg hover:scale-[1.02]"
        >
            <div className="flex justify-between items-center gap-4">
                {/* Left Side: Icon and Name */}
                <div className="flex items-center gap-4">
                    <div className="text-3xl">{style.icon}</div>
                    <div>
                        <p className="font-bold text-lg text-gray-800">{session.workout_name}</p>
                        <p className="text-sm text-gray-500">{date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </div>
                </div>
                {/* Right Side: Stats */}
                <div className="text-right shrink-0">
                    <p className={`font-semibold text-lg ${style.color}`}>{session.active_time_minutes || 0} min</p>
                    <p className="text-xs text-gray-400">
                        {session.workout_type === 'Strength' || session.workout_type === 'Hypertrophy'
                            ? `${session.total_volume || 0} kg total volume`
                            : `${session.workout_type}`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}