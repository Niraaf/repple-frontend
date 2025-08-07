import WorkoutBuilder from "@/components/WorkoutBuilder/WorkoutBuilder";
import { createSupabaseServerClient } from "@/supabase/supabaseServer";
import { notFound } from "next/navigation";
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getWorkoutInitialData(workoutId) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const userId = user?.id;
    const { data, error } = await supabase.rpc('get_workout_details_for_user', {
        p_workout_id: workoutId,
        p_user_id: userId
    });

    if (error) {
        console.error("RPC Error fetching workout details:", error);
        notFound();
    }
    if (!data) {
        console.log(`No data returned from RPC for workoutId: ${workoutId}`);
        notFound();
    }

    const isOwner = data.created_by_user_id === userId;
    if (!data.is_public && !isOwner) {
        notFound();
    }

    return data;
}

export default async function EditWorkoutPage({ params }) {
    const { workoutId } = await params;
    let initialData = null;

    if (workoutId !== 'new') {
        initialData = await getWorkoutInitialData(workoutId);
    }

    return (
        <div>
            <WorkoutBuilder workoutId={workoutId} initialData={initialData} />
        </div>
    );
}