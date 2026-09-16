import { Modal } from "@/components/product/modal";
import { Button } from "@/components/base/buttons/button";

// lh-graduate-popup — the very first screen of the happy path and the Gate scenario. This is a
// one-off: the Learning Hub (Novatr's existing course platform, not part of Placement Hub) is only
// ever seen dimmed behind this single modal, so it's a simplified backdrop rather than a
// componentized page — building out the full Learning Hub isn't in scope for this case study.
// Reference: docs/placement/spec/screens/lh-graduate-popup.png (node 3813:29779, see screen-map.md)
export const LearnerHubGraduatePopup = () => {
    return (
        <div className="min-h-full w-[1440px] bg-primary">
            <div className="flex h-16 items-center gap-8 border-b border-secondary px-8">
                <div className="flex items-center gap-1.5 text-lg font-bold">
                    <span style={{ color: "#1570EF" }}>NOVATR</span>
                    <span className="font-normal text-quaternary">/</span>
                    <span className="font-medium text-primary">Learning Hub</span>
                </div>
                <nav className="flex items-center gap-6 text-sm text-secondary">
                    <span>Courses ⌄</span>
                    <span>Resources ⌄</span>
                    <span>Partners ⌄</span>
                    <span>Events</span>
                    <span>Our Impact</span>
                </nav>
            </div>

            <div className="flex gap-8 p-8">
                <div className="flex-1">
                    <h2 className="text-xl text-primary">Hi Manik! Here are your courses.</h2>
                    <div className="mt-3 flex gap-2 text-sm">
                        <span className="rounded-full bg-neutral-900 px-3 py-1 font-medium text-white">Enrolled</span>
                        <span className="rounded-full border border-primary px-3 py-1 text-secondary">Transferred</span>
                        <span className="rounded-full border border-primary px-3 py-1 text-secondary">Cancelled</span>
                    </div>
                    <div className="mt-4 flex h-40 w-72 items-end rounded-xl bg-gradient-to-br from-purple-300 to-orange-300 p-3 text-xs font-medium text-white">
                        Building Information Modelling (BIM) — Cohort 4
                    </div>

                    <h3 className="mt-8 text-lg font-semibold text-brand-secondary">Novatr Placement Hub</h3>
                    <div className="mt-3 max-w-xl rounded-2xl bg-brand-secondary p-5">
                        <h4 className="text-lg font-semibold text-brand-secondary">
                            Congratulations! You are one of our successful graduates 🎉
                        </h4>
                        <p className="mt-2 text-sm text-tertiary">The wait is over. Placement Hub is now looking for skilled talent- Are you in?</p>
                        <Button color="brand" size="md" className="mt-3">
                            Go to Placement Hub
                        </Button>
                    </div>
                </div>

                <div className="w-64 shrink-0">
                    <p className="text-sm font-medium text-brand-secondary">Quick Links</p>
                    <ul className="mt-3 flex flex-col gap-3 text-sm text-secondary">
                        <li>Profile</li>
                        <li>My Applications</li>
                        <li>My Orders</li>
                        <li>Certificates</li>
                        <li className="font-semibold text-primary">Placement Hub</li>
                    </ul>
                </div>
            </div>

            <Modal width={480}>
                <div className="flex flex-col items-center text-center">
                    <span className="mb-4 text-5xl">🎉</span>
                    <div className="flex items-center gap-1.5 text-lg font-bold">
                        <span className="text-brand-secondary">NOVATR</span>
                        <span className="text-quaternary">/</span>
                        <span className="text-brand-secondary">Placement Hub</span>
                    </div>
                    <div className="my-4 w-full border-t border-secondary" />
                    <h3 className="text-lg font-semibold text-brand-secondary">
                        Congratulations!
                        <br />
                        You are one of our successful graduates. 🎉
                    </h3>
                    <p className="mt-2 text-sm text-tertiary">Placement Hub will be unlocked for you soon. In your cohort, you are a part of 35% graduated learners who are eligible for placements.</p>
                    <Button color="brand" size="md" className="mt-4 w-full justify-center">
                        Go to Placement Hub →
                    </Button>
                </div>
            </Modal>
        </div>
    );
};
