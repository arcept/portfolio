import sirenAsset from "@/assets/siren-icon.svg";

// The exported Siren asset has its fill color baked into the file, so a plain <img> can never be
// recolored to match surrounding text (it always rendered the export's original green, even next
// to orange/red text). Masking it lets the shape come from the real asset while the color follows
// `currentColor` like every other (recolorable) icon in this app.
export const SirenIcon = ({ className }: { className?: string }) => (
    <span
        role="img"
        aria-hidden
        className={className}
        style={{
            display: "inline-block",
            backgroundColor: "currentColor",
            // The asset resolves to a data: URI containing unescaped quotes (from its SVG attribute
            // syntax), which the CSS parser rejects inside an unquoted url() token — wrapping it in
            // quotes here is what makes the mask actually apply instead of silently no-op'ing.
            WebkitMaskImage: `url("${sirenAsset}")`,
            maskImage: `url("${sirenAsset}")`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
        }}
    />
);
