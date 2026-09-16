// Illustration pending Figma asset export — placeholder block stands in for the "parent helping
// child with homework" illustration until that export happens.
export const NeedHelpCard = () => {
    return (
        <div className="relative overflow-hidden rounded-2xl p-6" style={{ backgroundColor: "#1849A9" }}>
            <div className="flex flex-col gap-3">
                <h3 className="text-lg font-semibold text-white">Need Help?</h3>
                <p className="text-sm text-white/80">Contact us for assistance</p>
                <button type="button" className="mt-1 w-max rounded-lg bg-white px-3.5 py-2 text-sm font-semibold" style={{ color: "#1849A9" }}>
                    Get in touch →
                </button>
            </div>
            <div className="absolute right-4 bottom-0 flex h-16 w-20 items-end justify-center text-[10px] text-white/40">[illustration]</div>
        </div>
    );
};
