import { ArrowUpRight, Copy04, RefreshCcw01, Send01 } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Dot } from "@/components/foundations/dot-icon";
import courseCover from "@/assets/deals/course-cover.jpg";

export type ApplicationCardStatus = "new" | "pending" | "expired" | "completed";

/** Attached text field + copy button for the application-form link — Figma's "Input field"
 * node. `variant` controls both the copy affordance and whether the value reads as struck
 * through (expired link, kept visible so the BDR can see what timed out rather than the bare
 * Figma treatment of hiding it outright). */
const LinkField = ({ value, variant, onCopy }: { value: string; variant: "active" | "expired"; onCopy: () => void }) => (
    <div className="flex h-11 min-w-[220px] flex-1 items-stretch overflow-hidden rounded-lg shadow-xs">
        <div className="flex flex-1 items-center overflow-hidden rounded-l-lg border-y border-l border-secondary px-3.5">
            <span className={`truncate text-sm text-placeholder ${variant === "expired" ? "line-through" : ""}`}>{value}</span>
        </div>
        <button
            type="button"
            onClick={onCopy}
            disabled={variant === "expired"}
            aria-label="Copy application link"
            className="flex shrink-0 items-center justify-center rounded-r-lg border border-secondary bg-secondary px-3 text-fg-quaternary transition-colors duration-100 ease-linear hover:bg-secondary_hover hover:text-fg-secondary active:bg-quaternary disabled:cursor-not-allowed disabled:opacity-50"
        >
            <Copy04 className="size-4" />
        </button>
    </div>
);

export type ApplicationSectionCardProps = {
    courseName: string;
    durationValue: string;
    effortsValue: string;
    startDateLabel: string;
    status: ApplicationCardStatus;
    applicationUrl: string;
    sentOnLabel: string | null;
    resendCount: number;
    canResend: boolean;
    onSend: () => void;
    onResend: () => void;
    onCopyLink: () => void;
    onViewApplication: () => void;
};

/** "01 · Application" card — redesigned pixel-for-pixel from the Figma OMS-v3 export (frame
 * `Section — Application`, node 404:7211) rather than defaulting to stock Untitled UI card/badge
 * styling. All colors route through the theme's semantic tokens (`bg-tertiary`, `utility-amber-500`,
 * etc.) so the exact Figma look holds in both light and dark mode — the two exceptions are the
 * Send/Resend action colors, which use the same fixed `!bg-green-500`/`!text-neutral-900`-style
 * overrides already established for solid success buttons elsewhere in this app (see
 * `payment-plan-editor.tsx`), since those colors are meant to read the same regardless of theme. */
export const ApplicationSectionCard = ({
    courseName,
    durationValue,
    effortsValue,
    startDateLabel,
    status,
    applicationUrl,
    sentOnLabel,
    resendCount,
    canResend,
    onSend,
    onResend,
    onCopyLink,
    onViewApplication,
}: ApplicationSectionCardProps) => {
    const complete = status === "completed";
    const tone = complete ? "text-utility-green-500" : "text-utility-amber-500";

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-secondary bg-primary_alt">
            <div className="flex items-center justify-between gap-2 bg-tertiary/30 px-4 py-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                    <span className={tone}>01</span>
                    <span className="text-primary">Application</span>
                </div>
                <span className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-secondary shadow-xs">
                    <Dot size="sm" className={tone} />
                    {complete ? "Completed" : "Pending"}
                </span>
            </div>

            <div className="flex flex-col gap-4 p-6">
                <div className="flex gap-4 rounded-2xl p-2 shadow-xs">
                    <div className={`relative h-auto w-[180px] shrink-0 self-stretch overflow-hidden rounded-lg ${status === "new" ? "opacity-60" : ""}`}>
                        <img src={courseCover} alt="" className="absolute inset-0 size-full object-cover" />
                        {!complete && <div aria-hidden className="absolute inset-0 bg-black mix-blend-color" />}
                    </div>
                    <div className={`flex min-w-0 flex-1 flex-col gap-3 font-figtree ${status === "new" ? "opacity-40" : ""}`}>
                        <div className="flex flex-col gap-1">
                            <h3 className="text-2xl leading-8 font-semibold text-primary">{courseName}</h3>
                            <div className="flex flex-wrap items-start gap-6">
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-placeholder">Duration</span>
                                    <span className="text-base font-medium text-secondary">{durationValue}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-xs text-placeholder">Efforts</span>
                                    <span className="text-base font-medium text-secondary">{effortsValue}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-placeholder">Starts</span>
                            <span className="text-base font-semibold text-primary">{startDateLabel}</span>
                        </div>
                    </div>
                </div>

                {complete ? (
                    <div className="flex items-center gap-4">
                        <Button color="secondary" size="sm" iconTrailing={ArrowUpRight} onClick={onViewApplication} className="h-11">
                            View Application
                        </Button>
                        <Button color="link-color" size="sm" isDisabled className="opacity-30">
                            Edit Application
                        </Button>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-4 rounded-2xl bg-gradient-to-b from-tertiary/10 to-tertiary p-6 shadow-lg">
                        {status === "expired" ? (
                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-primary">Application form sent {sentOnLabel}</span>
                                <span className="text-error-primary">Application Form Link Has Expired</span>
                            </div>
                        ) : (
                            <p className="text-sm text-primary">
                                {status === "pending"
                                    ? `Application form sent ${sentOnLabel}${resendCount ? ` · resent ${resendCount}×` : ""} — awaiting the learner.`
                                    : "This deal hasn't been sent an application form yet."}
                            </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                            {status === "new" && (
                                <Button
                                    color="primary"
                                    size="sm"
                                    iconLeading={Send01}
                                    onClick={onSend}
                                    className="h-11 min-w-[184px] !bg-green-500 !text-neutral-900 !ring-green-400 hover:!bg-green-600 *:data-icon:!text-neutral-900"
                                >
                                    Send Application Form
                                </Button>
                            )}
                            {status === "pending" && (
                                <Button
                                    color="primary"
                                    size="sm"
                                    iconLeading={RefreshCcw01}
                                    isDisabled={!canResend}
                                    onClick={onResend}
                                    className="h-11 min-w-[184px] !bg-yellow-500 !text-neutral-900 !ring-yellow-400 hover:!bg-yellow-600 *:data-icon:!text-neutral-900"
                                >
                                    Resend Application
                                </Button>
                            )}
                            {status === "expired" && (
                                <Button
                                    color="primary"
                                    size="sm"
                                    iconLeading={RefreshCcw01}
                                    isDisabled={!canResend}
                                    onClick={onResend}
                                    className="h-11 min-w-[184px] !bg-utility-brand-100 !text-secondary hover:!bg-utility-brand-200 *:data-icon:!text-secondary"
                                >
                                    Regenerate Application Form Link
                                </Button>
                            )}

                            <LinkField value={applicationUrl} variant={status === "expired" ? "expired" : "active"} onCopy={onCopyLink} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
