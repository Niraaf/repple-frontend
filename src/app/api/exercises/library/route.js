import { supabase } from "@/supabase/supabase";

/**
 * API Route to fetch the entire exercise library and all filter options.
 * This is a single, efficient endpoint to populate the Exercise Modal.
 */
export async function GET() {
    try {
        // Run all database queries in parallel for maximum speed.
        const [
            exercisesRes,
            difficultiesRes,
            musclesRes,
            equipmentsRes,
            focusesRes,
            mechanicsRes
        ] = await Promise.all([
            // Query 1: Fetch all public exercises and their related data, using the nested select pattern.
            supabase.from('exercises')
                .select(`
                    id,
                    name,
                    description,
                    difficulties ( id, name ),
                    exercise_muscles ( muscles ( id, name ) ),
                    exercise_equipment ( equipments ( id, name ) ),
                    exercise_focuses ( focuses ( id, name ) ),
                    exercise_mechanics ( mechanics ( id, name ) )
                `)
                .eq('is_public', true)
                .order('name', { ascending: true }),

            // Queries 2-6: Fetch all possible filter options.
            supabase.from('difficulties').select('id, name').order('id'),
            supabase.from('muscles').select('id, name').order('name'),
            supabase.from('equipments').select('id, name').order('name'),
            supabase.from('focuses').select('id, name').order('name'),
            supabase.from('mechanics').select('id, name').order('name')
        ]);

        // Check if any of the parallel queries resulted in an error.
        const errors = [exercisesRes.error, difficultiesRes.error, musclesRes.error, equipmentsRes.error, focusesRes.error, mechanicsRes.error].filter(Boolean);
        if (errors.length > 0) {
            console.error("Error fetching exercise library data:", errors);
            throw new Error("One or more database queries failed.");
        }

        // Format the exercises data to match what the frontend components expect.
        // This flattens the nested structure returned by Supabase.
        const formattedExercises = exercisesRes.data.map(ex => ({
            id: ex.id,
            name: ex.name,
            description: ex.description,
            difficulty: ex.difficulties, // Supabase returns the single object directly
            muscles: ex.exercise_muscles.map(item => item.muscles),
            equipments: ex.exercise_equipment.map(item => item.equipments),
            focuses: ex.exercise_focuses.map(item => item.focuses),
            mechanics: ex.exercise_mechanics.map(item => item.mechanics)
        }));

        // Assemble the final payload.
        const responsePayload = {
            exercises: formattedExercises,
            filters: {
                difficulties: difficultiesRes.data,
                muscles: musclesRes.data,
                equipments: equipmentsRes.data,
                focuses: focusesRes.data,
                mechanics: mechanicsRes.data,
            }
        };

        // Return a successful response in the format you prefer.
        return new Response(JSON.stringify(responsePayload), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Error in /api/exercises/library:", error);
        return new Response(JSON.stringify({ message: error.message || "Internal Server Error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}