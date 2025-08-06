import { NextResponse } from "next/server";
import { supabase } from "@/supabase/supabase";

export async function POST(req) {
    try {
        const body = await req.json();
        const { workoutId, firebaseUid } = body;

        if (!firebaseUid || !workoutId) {
            return NextResponse.json({ message: "Missing required fields: workoutId and firebaseUid" }, { status: 400 });
        }

        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('firebase_uid', firebaseUid)
            .single();

        if (userError || !user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Create the new session record.
        // started_at is set to now(), and ended_at is NULL by default,
        // which marks this session as "active".
        const { data: newSession, error: insertError } = await supabase
            .from('sessions')
            .insert({
                user_id: user.id,
                workout_id: workoutId,
                started_at: new Date().toISOString(),
            })
            .select() // .select() returns the newly created row
            .single();

        if (insertError) throw insertError;

        return NextResponse.json(newSession, { status: 201 }); // 201 Created

    } catch (err) {
        console.error("Server error creating session:", err);
        return NextResponse.json({ message: "Internal Server Error", error: err.message }, { status: 500 });
    }
}