import lottie, { type AnimationItem } from "lottie-web";
import { useEffect, useRef } from "react";

// A thin wrapper around lottie-web directly rather than the lottie-react package — lottie-react's
// current major version ships its own rewritten renderer with stricter (and different) JSON
// expectations than the standard bodymovin schema, which silently rendered our hand-authored
// animation as empty paths. lottie-web is the canonical player and renders it correctly.
export const LottiePlayer = ({ animationData, loop = false, autoplay = true, className }: { animationData: object; loop?: boolean; autoplay?: boolean; className?: string }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const anim: AnimationItem = lottie.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop,
            autoplay,
            animationData,
        });
        return () => anim.destroy();
    }, [animationData, loop, autoplay]);

    return <div ref={containerRef} className={className} />;
};
