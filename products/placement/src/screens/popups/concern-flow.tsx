import { X } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";

// Two-panel pop-up shell shared by the relevancy-concern and offer-concern flows (illustration
// left, form/ack right) — visually distinct from the single-column Modal used elsewhere.
// References: popup-query-form.png, popup-offer-concern.png (form); popup-query-ack.png,
// popup-offer-concern-ack.png (acknowledged).
const SplitModal = ({ children }: { children: React.ReactNode }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/50 p-6">
        <div className="relative flex w-[720px] overflow-hidden rounded-2xl bg-primary shadow-xl">
            <div className="flex w-64 shrink-0 items-center justify-center bg-warning-primary p-6 text-6xl">🎧</div>
            <div className="relative flex-1 p-8">
                <button type="button" className="absolute top-4 right-4 flex size-8 items-center justify-center rounded-full text-quaternary hover:bg-secondary_hover" aria-label="Close">
                    <X className="size-4" />
                </button>
                {children}
            </div>
        </div>
    </div>
);

interface ConcernFormProps {
    heading: string;
}

export const ConcernForm = ({ heading }: ConcernFormProps) => (
    <SplitModal>
        <h3 className="text-lg font-semibold text-brand-secondary">{heading}</h3>
        <div className="mt-5">
            <label className="mb-1.5 block text-sm font-medium text-primary">What is your concern about?</label>
            <select className="w-full rounded-lg border border-primary p-2.5 text-sm text-tertiary">
                <option>Select</option>
            </select>
        </div>
        <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-primary">{heading.includes("job offer") ? "Tell us the details" : "Your Comments"}</label>
            <textarea className="w-full rounded-lg border border-primary p-3 text-sm text-secondary" rows={3} placeholder="Type your message here" />
        </div>
        <Button color="brand" size="md" className="mt-5 opacity-50">
            Submit
        </Button>
    </SplitModal>
);

interface ConcernAckProps {
    heading: string;
    body: string;
}

export const ConcernAck = ({ heading, body }: ConcernAckProps) => (
    <SplitModal>
        <div className="flex items-center gap-1.5 text-lg font-bold">
            <span className="text-brand-secondary">NOVATR</span>
            <span className="text-quaternary">/</span>
            <span className="text-brand-secondary">Placement Hub</span>
        </div>
        <div className="my-4 border-t border-secondary" />
        <h3 className="text-lg font-semibold text-brand-secondary">{heading}</h3>
        <p className="mt-2 text-sm text-tertiary">{body}</p>
    </SplitModal>
);
