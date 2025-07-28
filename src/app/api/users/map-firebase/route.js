import { supabase } from "@/supabase/supabase";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const firebaseUid = searchParams.get('firebaseUid');

    if (!firebaseUid) {
        return new Response(JSON.stringify({ message: 'Missing firebaseUid' }), { status: 400 });
    }

    const { data, error } = await supabase
        .from('profile')
        .select('userid')
        .eq('firebase_uid', firebaseUid)
        .single();

    if (error || !data) {
        console.error("Failed to map Firebase UID:", error);
        return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    return new Response(JSON.stringify({ userId: data.userid }), { status: 200 });
}
