import { useEffect, useState } from "react";

export default function useResponsiveTableHeight(offset = 360, minHeight = 260, headerSelector?: string) {
    const getHeight = () => {
        if (typeof window === 'undefined') return minHeight;

        let headerHeight = 0;
        try {
            if (headerSelector) {
                const el = document.querySelector(headerSelector) as HTMLElement | null;
                if (el) headerHeight = Math.ceil(el.getBoundingClientRect().height);
            }
        } catch {
            headerHeight = 0;
        }

        const calculated = window.innerHeight - offset - headerHeight;
        return Math.max(minHeight, calculated);
    };

    const [height, setHeight] = useState<number>(getHeight);

    useEffect(() => {
        let t: ReturnType<typeof setTimeout> | null = null;
        const onResize = () => {
            if (t) clearTimeout(t);
            t = setTimeout(() => {
                setHeight(getHeight());
            }, 120);
        };

        window.addEventListener('resize', onResize);
        // also observe mutations to header size (fonts, responsive layout)
        let ro: ResizeObserver | null = null;
        if (headerSelector && typeof ResizeObserver !== 'undefined') {
            const target = document.querySelector(headerSelector) as HTMLElement | null;
            if (target) {
                ro = new ResizeObserver(() => setHeight(getHeight()));
                ro.observe(target);
            }
        }

        return () => {
            window.removeEventListener('resize', onResize);
            if (t) clearTimeout(t);
            if (ro) ro.disconnect();
        };
    }, [offset, minHeight, headerSelector]);

    return height;
}
