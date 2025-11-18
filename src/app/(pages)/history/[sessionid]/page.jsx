import SessionSummary from "@/components/SessionHistory/SessionSummary";
import { createSupabaseServerClient } from "@/supabase/supabaseServer";
import { notFound, redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

async function getSessionDetails(sessionId) {
    console.log(`[DEBUG] Fetching details for session: ${sessionId}`);

    const supabase = await createSupabaseServerClient();
    
    // 1. Check Authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
        console.error("[DEBUG] Auth Error:", authError.message);
    }
    
    if (!user) {
        console.log("[DEBUG] No user found. Redirecting to login.");
        // Don't 404 here, redirect to login to be sure it's not just a session expiry
        return "REDIRECT_LOGIN";
    }

    console.log(`[DEBUG] User found: ${user.id}`);

    // 2. Check RPC Call
    const { data: sessionData, error } = await supabase
        .rpc('get_session_summary_details', {
            p_session_id: sessionId,
            p_user_id: user.id
        });

    if (error) {
        console.error("[DEBUG] RPC Error:", error);
        return null;
    }

    if (!sessionData) {
        console.log("[DEBUG] RPC returned NULL data. (Session likely doesn't exist or belongs to another user)");
        // This is the most likely cause of your 404
        return null;
    }

    console.log("[DEBUG] Session Data found successfully.");
    return sessionData;
}

export default async function SessionSummaryPage({ params }) {
    const { sessionId } = await params;
    const sessionData = await getSessionDetails(sessionId);

    if (sessionData === "REDIRECT_LOGIN") {
        redirect('/login');
    }

    if (!sessionData) {
        console.log("[DEBUG] Triggering notFound()");
        notFound();
    }

    return <SessionSummary sessionData={sessionData} />;
}