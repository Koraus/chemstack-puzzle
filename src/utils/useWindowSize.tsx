import { useState, useEffect } from 'preact/hooks';


export function useWindowSize() {
    const [size, setSize] = useState<{
        innerWidth: number;
        innerHeight: number;
    }>();

    useEffect(() => {
        const upd = () => {
            setSize({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
            });
        };
        upd();
        window.addEventListener('resize', upd);
        return () => window.removeEventListener('resize', upd);
    }, []);

    return size;
}
