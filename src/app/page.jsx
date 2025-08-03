"use client";

import { useAuth } from "@/contexts/authContext";

export default function Dashboard() {
    const { currentUser } = useAuth();

    return (
        <div>
            Landing page content goes here.
        </div>
    )
}