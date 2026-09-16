import { ChevronUp } from "@untitledui/icons";
import { NOVATR_BLUE } from "@/components/product/navbar";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { HomeSidebar } from "@/components/product/sidebars";
import { UPDATE_FIXTURES } from "@/state/fixtures/updates";

// home-updates-expanded — the fully expanded Important Updates feed. Reference:
// docs/placement/spec/screens/home-updates-end.png (the node reassigned to this slug, see
// screen-map.md Gaps — the originally-assigned node was a duplicate of the compressed view).
export const HomeUpdates = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" jobsHasUpdate sidebar={<HomeSidebar />}>
            <div className="flex items-center justify-between gap-6 rounded-2xl border border-secondary bg-primary p-6">
                <div>
                    <p className="text-lg text-primary">Hi Manik!</p>
                    <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                        Gear Up for Success …
                    </p>
                    <p className="text-lg font-medium" style={{ color: NOVATR_BLUE }}>
                        Find all your placement related updates here!
                    </p>
                </div>
                <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-brand-secondary text-xs text-brand-secondary">[illustration]</div>
            </div>

            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <div className="mb-4 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-primary">Important Updates</h3>
                    <span className="flex items-center gap-1 text-xs font-medium text-brand-secondary">
                        <span className="size-1.5 rounded-full bg-brand-solid" /> 4 New
                    </span>
                </div>

                <div className="flex flex-col divide-y divide-secondary">
                    {UPDATE_FIXTURES.map((update) => (
                        <div key={update.id} className="flex items-center justify-between gap-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[10px] font-bold text-white">A</span>
                                <div>
                                    <p className={`text-sm ${update.read ? "text-tertiary" : "font-medium text-primary"}`}>{update.text}</p>
                                    <p className="text-xs text-quaternary">12 Jan 2023</p>
                                </div>
                            </div>
                            <button type="button" className="shrink-0 text-sm font-semibold text-brand-secondary">
                                View Details →
                            </button>
                        </div>
                    ))}
                </div>

                <button type="button" className="mt-4 flex items-center gap-1 text-sm font-semibold text-brand-secondary">
                    <ChevronUp className="size-4" />
                    Hide
                </button>
                <p className="mt-1 text-sm text-quaternary">You've reached the end of the list.</p>

                <div className="my-6 border-t border-secondary" />
                <p className="text-sm text-tertiary">Your career success is our priority. Stay focused, stay prepared! Need help or have queries? Contact us at [email@email.com] or [phone number]. We're here to assist you every step of the way.</p>
            </div>
        </PlacementHubLayout>
    );
};
