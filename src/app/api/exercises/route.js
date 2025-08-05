import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

export async function GET(req) {
    try {
        // Instead of verifying a token, we get the UID from the URL's query parameters.
        const { searchParams } = new URL(req.url);
        const firebaseUid = searchParams.get('firebaseUid');

        let user = null;

        // If a UID was provided, look up the user's internal ID.
        // ⚠️ This part is INSECURE because we are trusting the client.
        if (firebaseUid) {
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id')
                .eq('firebase_uid', firebaseUid)
                .single();
            if (userError) console.warn("User lookup failed for provided UID:", firebaseUid);
            else user = userData;
        }

        // Build the base query
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

        // Modify the query based on whether we found a user
        if (user) {
            // Logged-in user: get public OR their own private exercises
            query = query.or(`is_public.eq.true,created_by_user_id.eq.${user.id}`);
        } else {
            // Guest user: get only public exercises
            query = query.eq('is_public', true);
        }

        const { data, error } = await query.order('name', { ascending: true });

        if (error) throw error;

        // Format the data for the frontend (same as before)
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