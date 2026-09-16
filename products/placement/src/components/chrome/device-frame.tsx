import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 1440;
const CANVAS_HEIGHT = 900;

interface DeviceFrameProps {
    children: React.ReactNode;
    /** Popup screens (Modal) — must render INSIDE this transformed box, not as a page-level
     * sibling, or their `fixed inset-0` covers the whole viewport (including the real chrome
     * controls below) instead of just the product canvas. See pages/walkthrough.tsx. */
    overlay?: React.ReactNode;
}

// The product canvas: fixed 1440×900 logical size, scaled uniformly to fit — never reflows
// (products/placement/CLAUDE.md). `transform: scale(...)` on this wrapper also makes it the
// containing block for any `position: fixed` popup inside (Modal), so overlays stay confined to
// the device frame instead of covering the chrome around it.
export const DeviceFrame = ({ children, overlay }: DeviceFrameProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect;
            setScale(Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT, 1));
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="flex size-full items-center justify-center overflow-hidden rounded-lg bg-[var(--sunk)] shadow-[0_1px_0_var(--rule)_inset]">
            <div
                className="relative shrink-0 overflow-hidden rounded-md bg-white shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)]"
                style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, transform: `scale(${scale})` }}
            >
                <div className="chrome-product-canvas size-full overflow-y-auto">{children}</div>
                {overlay}
            </div>
        </div>
    );
};
