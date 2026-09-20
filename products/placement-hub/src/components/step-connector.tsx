import connectorDot from "@/assets/step-connector.svg";
import connectorDotWithLine from "@/assets/step-connector-active.svg";

// Same masking trick as SirenIcon — both exported connector SVGs bake in a fixed blue, so mask
// them to recolor via currentColor (blue for past/current steps, red/gray for a terminal outcome).
export const StepConnector = ({ withLine, className }: { withLine: boolean; className?: string }) => {
    const asset = withLine ? connectorDotWithLine : connectorDot;
    return (
        <span
            role="img"
            aria-hidden
            className={className}
            style={{
                display: "inline-block",
                width: "10px",
                height: withLine ? "60px" : "24px",
                backgroundColor: "currentColor",
                WebkitMaskImage: `url("${asset}")`,
                maskImage: `url("${asset}")`,
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskPosition: "center",
            }}
        />
    );
};
