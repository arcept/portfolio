import { Button } from "@/components/base/buttons/button";
import { PlacementHubLayout } from "@/components/product/placement-hub-layout";
import { DefaultSidebar } from "@/components/product/sidebars";

const QUESTIONS = [
    { n: 1, label: "What is the name of the company where you've been placed?", placeholder: "Company's Name" },
    { n: 2, label: "What is your new designation or role?", placeholder: "Your Designation" },
    { n: 3, label: "Where is your new job located? (City/State/Country)", placeholder: "Job Location" },
    { n: 4, label: "What is the offered CTC (Cost to Company)?", placeholder: "CTC in Lacs Per Annum" },
];

// selfplaced-form — Gate scenario, "Not eligible" branch, final step. A learner who secured a job
// independently self-reports it here (standing: self_placed). Reference: docs/placement/spec/screens/selfplaced-form-a.png
export const SelfplacedForm = () => {
    return (
        <PlacementHubLayout activeTab="home" userName="Manik" navVariant="locked" sidebar={<DefaultSidebar />}>
            <div className="flex items-center justify-between gap-6 rounded-2xl border border-secondary bg-primary p-6">
                <div>
                    <p className="text-lg text-primary">Hi Manik!</p>
                    <h2 className="text-xl font-semibold text-warning-primary">Celebrate Your Career Milestones With Us</h2>
                    <p className="mt-2 max-w-lg text-sm text-tertiary">
                        Your success is our celebration! If you've landed a job through your own efforts, we're thrilled to hear about it. Share your achievements with us and let your story
                        inspire and motivate your peers. Your journey matters!
                    </p>
                </div>
                <div className="flex h-24 w-28 shrink-0 items-center justify-center rounded-xl bg-warning-primary text-xs text-warning-primary">[illustration]</div>
            </div>

            <div className="rounded-2xl border border-secondary bg-primary p-6">
                <div className="flex flex-col gap-5">
                    {QUESTIONS.map((q) => (
                        <div key={q.n}>
                            <label className="mb-1.5 block text-sm font-medium text-primary">
                                {q.n}. {q.label}
                            </label>
                            <input type="text" placeholder={q.placeholder} className="w-full max-w-sm rounded-lg border border-primary p-2.5 text-sm text-placeholder" />
                        </div>
                    ))}
                </div>

                <p className="mt-6 text-sm text-tertiary">Your achievements are a testament to hard work and perseverance. Sharing your experience can greatly encourage and guide your peers on their career paths.</p>

                <Button color="brand" size="md" className="mt-4 opacity-50">
                    Submit My Story →
                </Button>

                <div className="mt-6 border-t border-secondary pt-4">
                    <p className="text-sm font-semibold text-primary">Thank you for taking the time to provide your details.</p>
                    <p className="text-sm text-tertiary">Your career success matters to us.</p>
                </div>
            </div>
        </PlacementHubLayout>
    );
};
