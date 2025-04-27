import { supabase } from "@/supabase/supabase";

export async function GET() {
    const [muscleGroups, equipment, exerciseTypes, focusCategories] = await Promise.all([
        supabase.from('muscle_groups').select('name'),
        supabase.from('equipment').select('name'),
        supabase.from('exercise_types').select('name'),
        supabase.from('focus_categories').select('name')
    ]);

    if (muscleGroups.error || equipment.error || exerciseTypes.error || focusCategories.error) {
        return new Response(JSON.stringify({ message: 'Failed to fetch filter options' }), { status: 500 });
    }

    return new Response(JSON.stringify({
        muscleGroups: muscleGroups.data.map(m => m.name),
        equipment: equipment.data.map(e => e.name),
        exerciseTypes: exerciseTypes.data.map(t => t.name),
        focus: focusCategories.data.map(f => f.name)
    }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
