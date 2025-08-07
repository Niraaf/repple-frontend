import WorkoutList from "@/components/WorkoutList/WorkoutList";
import { createSupabaseServerClient } from "@/supabase/supabaseServer";

async function getUserWorkouts() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: workouts, error } = await supabase
    .rpc('get_user_workouts_with_stats', { p_user_id: user.id });

  if (error) {
    console.error("Error fetching user workouts on server:", error);
    return [];
  }

  return workouts;
}

export default async function WorkoutListPage() {
  const initialWorkouts = await getUserWorkouts();

  return (
    <div>
      <WorkoutList initialWorkouts={initialWorkouts} />
    </div>
  );
}