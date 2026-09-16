import { TRACKER_STAGE_ORDER } from "@/components/product/application-status-config";
import type { Application } from "@/state/learner-state";
import { APPLICATION_STATUS_CONFIG } from "@/components/product/application-status-config";

interface StepsTrackerProps {
    companyName: string;
    application: Application;
    /** Placeholder date, matching the reference screens' fixed "15 Nov 2023" for every row. */
    date?: string;
}

// "Track your application here" panel (components.md: Steps, node 3958:98215) — reads
// `application.history` so it's always in sync with the Messages banner on the JD itself.
export const StepsTracker = ({ companyName, application, date = "15 Nov 2023" }: StepsTrackerProps) => {
    const reachedStages = TRACKER_STAGE_ORDER.filter((stage) => application.history.includes(stage));

    return (
        <div className="overflow-hidden rounded-2xl border border-secondary bg-primary">
            <div className="h-1.5 bg-brand-solid" />
            <div className="p-5">
                <p className="text-sm font-medium text-brand-secondary">Track your application here</p>
                <h3 className="mt-1 text-lg font-semibold text-primary">Your Journey with {companyName}</h3>

                <div className="mt-4 flex flex-col">
                    {reachedStages.map((stage, i) => {
                        const config = APPLICATION_STATUS_CONFIG[stage];
                        const isLast = i === reachedStages.length - 1;
                        return (
                            <div key={stage} className="relative flex items-center gap-3 pb-5 last:pb-0">
                                {!isLast && <span className="absolute top-2 left-[75px] h-full w-px bg-brand-solid" />}
                                <span className="w-[68px] shrink-0 text-xs text-quaternary">{date}</span>
                                <span className="z-10 size-2 shrink-0 rounded-full bg-brand-solid" />
                                <span className={isLast ? "text-sm font-semibold text-primary" : "text-sm text-tertiary"}>{config?.trackerLabel ?? stage}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
