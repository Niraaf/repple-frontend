import { NextResponse } from 'next/server';
import { createSupabaseBrowserClient } from '@/supabase/supabaseClient';

const supabase = createSupabaseBrowserClient();

/**
 * API Route to fetch all available filter options for the exercise library.
 */
export async function GET() {
    try {
        const [difficulties, muscles, equipments, focuses, mechanics] = await Promise.all([
            supabase.from('difficulties').select('id, name').order('id'),
            supabase.from('muscles').select('id, name').order('name'),
            supabase.from('equipments').select('id, name').order('name'),
            supabase.from('focuses').select('id, name').order('name'),
            supabase.from('mechanics').select('id, name').order('name')
        ]);

        const error = [difficulties.error, muscles.error, equipments.error, focuses.error, mechanics.error].find(Boolean);
        if (error) throw error;

        const filterOptions = {
            difficulties: difficulties.data,
            muscles: muscles.data,
            equipments: equipments.data,
            focuses: focuses.data,
            mechanics: mechanics.data,
        };

        return NextResponse.json(filterOptions, { status: 200 });
    } catch (error) {
        console.error("Error fetching exercise filters:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}