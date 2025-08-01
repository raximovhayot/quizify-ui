import {useEffect, useState} from 'react';

export function useIsHydrated(): boolean {
    const [isHydrated, setIsHydrated] = useState(false);
    useEffect(() => {
        // This effect only runs on the client side after hydration
        setIsHydrated(true);
    }, []);
    return isHydrated;
}

