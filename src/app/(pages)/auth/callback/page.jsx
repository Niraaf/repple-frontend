'use client';

import { useEffect } from 'react';
import { useRouter } from 'nextjs-toploader/app';
import { createSupabaseBrowserClient } from '@/supabase/supabaseClient';

const supabase = createSupabaseBrowserClient();

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                router.push('/dashboard');
            } else {
                router.push('/login?error=auth_failed');
            }
        };

        handleAuthCallback();
    }, [router]);

    return (
        <div className="flex justify-center items-center h-screen">
            <p className="text-lg animate-pulse">Finalizing authentication, please wait...</p>
        </div>
    );
}