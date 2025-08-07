import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/supabase/supabaseAdmin'; // Use the ADMIN client
import { getAuthenticatedUser } from '@/lib/authHelper';

/**
 * API Route to fetch exercises.
 * - If the user is a guest (no auth token), it returns only public, official exercises.
 * - If the user is logged in (valid auth token), it returns all public exercises
 * PLUS the user's own private custom exercises.
 */
export async function GET(req) {
    try {
        const { user } = await getAuthenticatedUser(req);

        let query = supabase
            .from('exercises')
            .select(`
                id, name, slug, description,
                difficulties ( name ),
                exercise_muscles ( muscles ( id, name ) ),
                exercise_equipment ( equipments ( id, name ) ),
                exercise_focuses ( focuses ( id, name ) ),
                exercise_mechanics ( mechanics ( id, name ) )
            `);

        if (user) {
            // If we have a logged-in user, fetch public exercises OR their own private ones.
            console.log(`Fetching exercises for user: ${user.id}`);
            query = query.or(`is_public.eq.true,created_by_user_id.eq.${user.id}`);
        } else {
            // If no user, they are a guest. Fetch only public exercises.
            console.log("Fetching exercises for a guest user.");
            query = query.eq('is_public', true);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) throw error;

        const formattedExercises = data.map(ex => ({
            id: ex.id,
            name: ex.name,
            slug: ex.slug,
            description: ex.description,
            difficulty: ex.difficulties,
            muscles: ex.exercise_muscles.map(item => item.muscles),
            equipments: ex.exercise_equipment.map(item => item.equipments),
            focuses: ex.exercise_focuses.map(item => item.focuses),
            mechanics: ex.exercise_mechanics.map(item => item.mechanics)
        }));

        return NextResponse.json(formattedExercises, { status: 200 });

    } catch (error) {
        console.error("Error fetching exercises:", error);
        return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
    }
}