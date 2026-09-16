// Illustration pending Figma asset export (not in Task 0's asset list) — placeholder gradient block
// stands in for the "friends celebrating" illustration until that export happens.
export const SuccessSpotlightCard = () => {
    return (
        <div className="overflow-hidden rounded-2xl border border-secondary bg-primary">
            <div className="flex h-32 items-center justify-center bg-gradient-to-br from-yellow-200 to-orange-200">
                <span className="text-xs font-medium text-orange-800/60">[illustration placeholder]</span>
            </div>
            <div className="flex flex-col gap-2 p-6">
                <p className="text-sm text-tertiary">Your success is our celebration</p>
                <p className="text-lg font-semibold text-warning-primary">Got placed with your own hard work?</p>
                <p className="text-sm text-tertiary">Let's make your achievements known on our portal. Your story inspires others as well.</p>
                <button type="button" className="mt-1 self-start text-sm font-semibold text-primary underline underline-offset-2">
                    Share your triumphs with us →
                </button>
            </div>
        </div>
    );
};
