'use client';

import { initHelloRetailTracking } from 'app/actions/initHelloRetailTracking';
import { useEffect } from 'react';

/**
 * Initializes Hello Retail tracking user ID by calling a Server Action
 * This ensures the tracking user ID cookie is set before tracking begins.
 * Should be rendered once in the app layout.
 */
export default function HelloRetailUserInit() {
    useEffect(() => {
        // Call Server Action to initialize tracking ID
        // This will fetch from API if needed and store in cookie
        initHelloRetailTracking().catch(() => {
            // Silently fail - cookie might already exist or will be set on next request
        });
    }, []);

    return null;
}

