import { supabase } from "@/supabase/supabase";

export async function GET() {
    const { data, error } = await supabase
        .from('exercise_definitions')
        .select(`
            id,
            name,
            is_custom,
            equipment ( name ),
            exercise_types ( name ),
            focus_categories ( name ),
            exercise_muscle_groups (
            muscle_groups ( name )
            )
        `);

    if (error) {
        console.error('Error fetching exercises:', error);
        return new Response(JSON.stringify({ message: 'Failed to fetch exercises' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const formattedData = data.map(ex => ({
        id: ex.id,
        name: ex.name,
        is_custom: ex.is_custom,
        muscle_groups: ex.exercise_muscle_groups?.map(mg => mg.muscle_groups.name) || [],
        equipment: ex.equipment?.name || null,
        type: ex.exercise_types?.name || null,
        focus: ex.focus_categories?.name || null
    }));

    return new Response(JSON.stringify(formattedData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
