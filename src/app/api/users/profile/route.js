import { NextResponse } from 'next/server';
import { supabase } from '@/supabase/supabase';

export async function GET(req) {
    try {
        // For development, we get the UID from the URL's query parameters.
        const { searchParams } = new URL(req.url);
        const firebaseUid = searchParams.get('firebaseUid');

        if (!firebaseUid) {
            return NextResponse.json({ message: 'Missing firebaseUid' }, { status: 400 });
        }

        // ⚠️ INSECURE: We are trusting the firebaseUid sent from the client.
        const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('firebase_uid', firebaseUid)
            .single();

        if (error) {
            // Specifically handle the "not found" case
            if (error.code === 'PGRST116') {
                return NextResponse.json({ message: 'User profile not found.' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json(userProfile, { status: 200 });

    } catch (error) {
        console.error("Error fetching user profile:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}